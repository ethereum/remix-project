import { CustomTooltip } from '@remix-ui/helper'
import React, { Fragment, Ref } from 'react'
import { Dropdown } from 'react-bootstrap'
import { UmlFileType } from '../utilities/UmlDownloadStrategy'

const _paq = (window._paq = window._paq || [])

export const Markup = React.forwardRef(
  (
    {
      children,
      onClick,
      icon,
      className = "",
    }: {
      children: React.ReactNode
      onClick: (e) => void
      icon: string
      className: string
    },
    ref: Ref<HTMLButtonElement>
  ) => (
    <button
      ref={ref}
      onClick={(e) => {
        e.preventDefault()
        onClick(e)
      }}
      className={className.replace("dropdown-toggle", "")}
    >
      <i className={icon}></i>
    </button>
  )
)

export const UmlCustomMenu = React.forwardRef(
  (
    {
      children,
      style,
      className,
      "aria-labelledby": labeledBy,
    }: {
      children: React.ReactNode
      style?: React.CSSProperties
      className: string
      "aria-labelledby"?: string
    },
    ref: Ref<HTMLDivElement>
  ) => {
    const height = window.innerHeight * 0.6
    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <ul
          className="overflow-auto list-unstyled mb-0"
          style={{ maxHeight: height + "px" }}
        >
          {children}
        </ul>
      </div>
    )
  }
)

interface UmlDownloadProps {
  download: (fileType: UmlFileType) => void
}

export default function UmlDownload(props: UmlDownloadProps) {
  return (
    <Fragment>
      <Dropdown id="solUmlMenuDropdown">
        <Dropdown.Toggle
          icon="far fa-arrow-to-bottom uml-btn-icon"
          as={Markup}
          className="badge badge-info remixui_no-shadow p-2 rounded-circle mr-2"
        ></Dropdown.Toggle>
        <Dropdown.Menu as={UmlCustomMenu} className="custom-dropdown-items">
          <Dropdown.Item
            onClick={() => {
              _paq.push([
                "trackEvent",
                "solidityumlgen",
                "download",
                "downloadAsPng",
              ]);
              props.download("png")
            }}
          >
            <CustomTooltip
              placement="left-start"
              tooltipId="solUmlgenDownloadAsPngTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={"Download UML diagram as a PNG file"}
            >
              <div data-id="umlPngDownload">
                <span
                  id="umlPngDownloadBtn"
                  data-id="umlPngDownload"
                  className="far fa-image pl-2"
                ></span>
                <span className="pl-1">Download as PNG</span>
              </div>
            </CustomTooltip>
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            onClick={() => {
              _paq.push([
                "trackEvent",
                "solUmlgen",
                "download",
                "downloadAsPdf",
              ]);
              props.download("pdf")
            }}
          >
            <CustomTooltip
              placement="left-start"
              tooltipId="solUmlgenDownloadAsPdfTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={"Download UML diagram as a PDF file"}
            >
              <div data-id="umlPdfDownload">
                <span
                  id="umlPdfDownloadBtn"
                  data-id="umlPdfDownload"
                  className="far fa-file-pdf pl-2"
                ></span>
                <span className="pl-2">Download as PDF</span>
              </div>
            </CustomTooltip>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Fragment>
  )
}
