import { ImageResponse } from "next/og";

export const alt = "Bangladesh Betar — news, video and sound from Bangladesh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #f8faf9 0%, #e6f2ed 52%, #f5dce2 100%)",
        color: "#17211d",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ background: "#006a4e", borderRadius: 999, height: 360, opacity: 0.1, position: "absolute", right: -80, top: -100, width: 360 }} />
      <div style={{ background: "#f42a41", borderRadius: 999, bottom: -120, height: 320, left: -80, opacity: 0.12, position: "absolute", width: 320 }} />
      <div style={{ alignItems: "center", display: "flex", flexDirection: "column", textAlign: "center" }}>
        <div style={{ alignItems: "center", background: "#006a4e", borderRadius: 999, color: "white", display: "flex", fontSize: 54, fontWeight: 800, height: 128, justifyContent: "center", width: 128 }}>BB</div>
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-3px", marginTop: 30 }}>Bangladesh Betar</div>
        <div style={{ color: "#52605a", fontSize: 31, marginTop: 16 }}>News, stories and sound from Bangladesh</div>
        <div style={{ background: "#f42a41", borderRadius: 10, height: 10, marginTop: 38, width: 190 }} />
      </div>
    </div>,
    size,
  );
}
