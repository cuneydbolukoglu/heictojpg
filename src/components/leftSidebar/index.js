import React from "react";
import { Layout, Button, Menu, Divider } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightLeft,
  faClockRotateLeft,
  faGear,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

const { Sider } = Layout;

export default function LeftSidebar({
  active = "converter",
  onSelect, // (key) => void (opsiyonel)
}) {
  const items = [
    {
      key: "converter",
      icon: (
        <span
          style={{
            display: "inline-flex",
            width: 28,
            height: 28,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            background: active === "converter" ? "rgba(80,150,255,0.18)" : "rgba(255,255,255,0.05)",
          }}
        >
          <FontAwesomeIcon
            icon={faRightLeft}
            style={{ fontSize: 14, color: active === "converter" ? "#52a8ff" : "#9aa7b2" }}
          />
        </span>
      ),
      label: "Converter",
    },
    {
      key: "history",
      icon: (
        <span
          style={{
            display: "inline-flex",
            width: 28,
            height: 28,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            background: active === "history" ? "rgba(80,150,255,0.18)" : "rgba(255,255,255,0.05)",
          }}
        >
          <FontAwesomeIcon
            icon={faClockRotateLeft}
            style={{ fontSize: 14, color: active === "history" ? "#52a8ff" : "#9aa7b2" }}
          />
        </span>
      ),
      label: "Conversion History",
    },
    {
      key: "settings",
      icon: (
        <span
          style={{
            display: "inline-flex",
            width: 28,
            height: 28,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            background: active === "settings" ? "rgba(80,150,255,0.18)" : "rgba(255,255,255,0.05)",
          }}
        >
          <FontAwesomeIcon
            icon={faGear}
            style={{ fontSize: 14, color: active === "settings" ? "#52a8ff" : "#9aa7b2" }}
          />
        </span>
      ),
      label: "Settings",
    },
  ];

  return (
      <Sider
        width={280}
        style={{
          background: "#0d1117",
          borderRight: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[active]}
          items={items}
          onSelect={(info) => onSelect?.(info.key)}
          style={{
            background: "transparent",
            border: 0
          }}
        />
        <div style={{ marginTop: "auto"}}>
          <Divider />
          <Button
            type="primary"
            size="large"
            icon={<FontAwesomeIcon icon={faDownload} />}
            block
            style={{
              background: "#4dabff",
              borderRadius: 14,
              fontWeight: 700,
              height: 44,
            }}
          >
            Download App
          </Button>
        </div>
      </Sider>
  );
}