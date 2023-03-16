import React from "react"

import { NavLink } from "react-router-dom"
import { AppContext } from "../AppContext"
import { ThemeType } from "../types"

interface Props {
  title?: string
  showBackButton?: boolean
  from: string
}

interface IconProps {
  from: string
  themeType: ThemeType
}

const HomeIcon: React.FC<IconProps> = ({ from, themeType }: IconProps) => {
  return (
    <NavLink
      data-id="home"
      data-toggle="tooltip"
      data-placement="top"
      title="Home"
      to={{
        pathname: "/"
      }}
      state={ from }
      style={isActive => {
        return {
          ...(isActive ? getStyleFilterIcon(themeType) : {}), ...{ marginRight: "0.4em" }
        }
      }}
    >
      <svg
        style={{ filter: "invert(0.5)" }}
        width="1em"
        height="1em"
        viewBox="0 0 16 16"
        className="bi bi-house-door-fill"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6.5 10.995V14.5a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .146-.354l6-6a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 .146.354v7a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5V11c0-.25-.25-.5-.5-.5H7c-.25 0-.5.25-.5.495z" />
        <path
          fillRule="evenodd"
          d="M13 2.5V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"
        />
      </svg>
    </NavLink>
  )
}

const SettingsIcon: React.FC<IconProps> = ({ from, themeType }: IconProps) => {
  return (
    <NavLink
      data-toggle="tooltip"
      data-placement="top"
      title="Settings"
      to={{
        pathname: "/settings",
      }}
      state= {from}
      style={isActive => {
        return {
          ...(isActive ? getStyleFilterIcon(themeType) : {}), ...{ marginRight: "0.4em" }
        }
      }}
    >
      <svg
        style={{ filter: "invert(0.5)" }}
        width="1em"
        height="1em"
        viewBox="0 0 16 16"
        className="bi bi-gear-fill"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 0 0-5.86 2.929 2.929 0 0 0 0 5.858z"
        />

        <path
          fillRule="evenodd"
          d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 0 0-5.86 2.929 2.929 0 0 0 0 5.858z"
        />
      </svg>
    </NavLink>
  )
}

const getStyleFilterIcon = (themeType: ThemeType) => {
  const invert = themeType === "dark" ? 1 : 0
  const brightness = themeType === "dark" ? "150" : "0" // should be >100 for icons with color
  return {
    filter: `invert(${invert}) grayscale(1) brightness(${brightness}%)`,
  }
}

const ReceiptsIcon: React.FC<IconProps> = ({ from, themeType }: IconProps) => {
  return (
    <NavLink      
      data-toggle="tooltip"
      data-placement="top"
      title="Receipts"
      to={{
        pathname: "/receipts",
      }}
      state= { from }
      style={isActive => {
        return {
          ...(isActive ? getStyleFilterIcon(themeType) : {}), ...{ marginRight: "0.4em" }
        }
      }}
    >
      <svg
        style={{ filter: "invert(0.5)" }}
        width="1em"
        height="1em"
        viewBox="0 0 16 16"
        className="bi bi-receipt"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27zm.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0l-.509-.51z"
        />

        <path
          fillRule="evenodd"
          d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"
        />
      </svg>
    </NavLink>
  )
}
export const HeaderWithSettings: React.FC<Props> = ({
  title = "",
  showBackButton = false,
  from,
}) => {
  return (
    <AppContext.Consumer>
      {({ themeType }) => (
        <div>
          <h6>{title}</h6>
          <div style={{ float: "right" }}>
            <HomeIcon from={from} themeType={themeType} />
            <ReceiptsIcon from={from} themeType={themeType} />
            <SettingsIcon from={from} themeType={themeType} />
          </div>
        </div>
      )}
    </AppContext.Consumer>
  )
}
