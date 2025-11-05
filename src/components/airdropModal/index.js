import { useState, useEffect } from "react";
import { message, Typography, Flex, Modal } from "antd";
import { FileImageOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWifi } from "@fortawesome/free-solid-svg-icons";

const { Paragraph } = Typography;

export const AirDropModal = ({ onFilesConvert }) => {
    const [airdropModalVisible, setAirdropModalVisible] = useState(false);
    const [pendingAirdropFiles, setPendingAirdropFiles] = useState([]);

    useEffect(() => {
        if (window.electronAPI) {
            const handleAirdropFileDetected = async (event, data) => {
                console.log('AirDrop file detected:', data);

                if (!data || !data.file || !data.file.name) {
                    console.error('Invalid AirDrop data:', data);
                    return;
                }

                setPendingAirdropFiles(prev => {
                    const newFiles = [...prev, data.file];
                    setAirdropModalVisible(true);
                    return newFiles;
                });
            };

            window.electronAPI.onAirdropFileDetected(handleAirdropFileDetected);

            return () => {
                if (window.electronAPI) {
                    window.electronAPI.removeAllListeners('airdrop-file-detected');
                }
            };
        }
    }, []);

    const handleAirdropConvert = async () => {
        if (!pendingAirdropFiles || pendingAirdropFiles.length === 0) {
            setAirdropModalVisible(false);
            return;
        }

        setAirdropModalVisible(false);

        try {
            const filesToConvert = [];

            console.log('🔄 Starting AirDrop conversion for files:', pendingAirdropFiles);

            for (const airdropFile of pendingAirdropFiles) {
                if (!airdropFile || !airdropFile.path || !airdropFile.name) {
                    console.warn('⏭️ Skipping invalid AirDrop file:', airdropFile);
                    continue;
                }

                try {
                    console.log(`📥 Processing AirDrop file: ${airdropFile.name}`);

                    const result = await window.electronAPI.readAirdropFile(airdropFile.path);

                    if (result && result.success) {
                        console.log(`✅ Successfully read: ${airdropFile.name}, buffer size:`, result.buffer.length);

                        const blob = new Blob([result.buffer], {
                            type: airdropFile.name.toLowerCase().endsWith('.heic') ? 'image/heic' : 'image/heif'
                        });

                        const file = new File([blob], airdropFile.name, {
                            type: blob.type,
                            lastModified: Date.now()
                        });

                        filesToConvert.push(file);
                        console.log(`✅ Created File object for: ${airdropFile.name}`);
                    } else {
                        console.error(`❌ Failed to read AirDrop file: ${airdropFile.name}`, result?.error);
                        message.error(`Failed to read: ${airdropFile.name}`);
                    }
                } catch (fileError) {
                    console.error(`❌ Error processing AirDrop file ${airdropFile.name}:`, fileError);
                    message.error(`Error processing: ${airdropFile.name}`);
                }
            }

            console.log('📊 Total files ready for conversion:', filesToConvert.length);

            if (filesToConvert.length > 0) {
                onFilesConvert(filesToConvert);
                message.success(`Processed ${filesToConvert.length} file(s) from AirDrop`);
            } else {
                message.warning('No valid files to convert from AirDrop');
            }

        } catch (error) {
            console.error('❌ Error processing AirDrop files:', error);
            message.error('Failed to process AirDrop files');
        } finally {
            setPendingAirdropFiles([]);
            if (window.electronAPI) {
                await window.electronAPI.clearPendingAirdropFiles();
            }
        }
    };

    const handleAirdropCancel = async () => {
        setAirdropModalVisible(false);
        setPendingAirdropFiles([]);

        if (window.electronAPI) {
            await window.electronAPI.clearPendingAirdropFiles();
        }
    };

    const safeFileNames = pendingAirdropFiles
        .filter(file => file && file.name)
        .map(file => file.name);

    return (
        <Modal
            title={<span><FontAwesomeIcon icon={faWifi} style={{ color: '#1890ff' }} /> AirDrop Files Detected</span>}
            open={airdropModalVisible && safeFileNames.length > 0}
            onOk={handleAirdropConvert}
            onCancel={handleAirdropCancel}
            okText="Convert All"
            cancelText="Cancel"
            width={500}
        >
            <Flex vertical style={{ margin: '20px 0' }}>
                <Paragraph>
                    {safeFileNames.length === 1
                        ? `Do you want to convert "${safeFileNames[0]}"?`
                        : `Do you want to convert ${safeFileNames.length} files from AirDrop?`
                    }
                </Paragraph>

                {safeFileNames.length > 1 && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '6px',
                        marginTop: '12px'
                    }}>
                        <Paragraph strong style={{ marginBottom: '8px' }}>
                            Files:
                        </Paragraph>
                        {safeFileNames.map((fileName, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '4px',
                                padding: '4px 0'
                            }}>
                                <FileImageOutlined style={{ marginRight: '8px' }} />
                                <span>{fileName}</span>
                            </div>
                        ))}
                    </div>
                )}
                <Paragraph type="secondary" style={{ marginTop: '16px', fontSize: '12px' }}>
                    Files are received via AirDrop and will be converted to JPG format.
                </Paragraph>
            </Flex>
        </Modal>
    );
};