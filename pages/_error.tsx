import type { NextPageContext } from "next"
import Link from "next/link"

interface ErrorPageProps {
  statusCode: number
}

function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "Avenir Next, Helvetica Neue, Helvetica, Arial, sans-serif",
        background: "#f2ede4",
        color: "#2f2a24",
      }}
    >
      <section
        style={{
          maxWidth: "32rem",
          width: "100%",
          border: "1px solid #d7ccbc",
          borderRadius: "10px",
          background: "#fbf8f2",
          padding: "1.25rem 1.5rem",
          boxShadow: "0 1.5rem 2.5rem -2rem rgba(30, 24, 17, 0.45)",
        }}
      >
        <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#8f8475" }}>
          system error
        </p>
        <h1 style={{ margin: "0.45rem 0 0.5rem", fontSize: "1.65rem" }}>
          {statusCode === 404 ? "Page Not Found" : "Unexpected Error"}
        </h1>
        <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55, color: "#4f4538" }}>
          Error code: {statusCode}. The requested route could not be served.
        </p>
        <p style={{ marginTop: "0.85rem", fontSize: "0.92rem" }}>
          <Link href="/" style={{ color: "#8a7451", textDecoration: "underline" }}>
            Return to homepage
          </Link>
        </p>
      </section>
    </main>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404
  return { statusCode }
}

export default ErrorPage
