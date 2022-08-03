import React from "react"

export const ErrorView: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img
        style={{ paddingBottom: "2em" }}
        width="250"
        src="https://res.cloudinary.com/key-solutions/image/upload/v1580400635/solid/error-png.png"
        alt="Error page"
      />
      <h5>Sorry, something unexpected happened. </h5>
      <h5>
        Please raise an issue:{" "}
        <a
          style={{ color: "red" }}
          href="https://github.com/machinalabs/remix-etherscan/issues"
        >
          Here
        </a>
      </h5>
    </div>
  )
}
