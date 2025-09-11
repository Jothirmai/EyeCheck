export default function AuthSocialButtons() {
  return (
    <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
      <button style={{ border: "none", background: "none" }}>
        <img src="/google.svg" alt="Google" height={28} />
      </button>
      <button style={{ border: "none", background: "none" }}>
        <img src="/facebook.svg" alt="Facebook" height={28} />
      </button>
    </div>
  );
}
