import jsPDF from 'jspdf'
import 'svg2pdf.js'
import { SVG } from '@svgdotjs/svg.js'
import { Canvg } from 'canvg'


const jsPdf = new jsPDF('landscape', 'px', 'a4')

interface IUmlDownloadStrategy {
  download (uml: string, fileName: string): void
}

export type UmlFileType = 'pdf' | 'png'

class PdfUmlDownloadStrategy implements IUmlDownloadStrategy {
  doc: jsPDF
  constructor(pdf: jsPDF) {
    this.doc = pdf
  }
  public download (uml: string, fileName: string): void {
    const parser = new DOMParser()
    const parsedDocument = parser.parseFromString(uml, 'image/svg+xml')
    const element = parsedDocument.documentElement
    const pageWidth = this.doc.internal.pageSize.getWidth()
    const pageHeight = this.doc.internal.pageSize.getHeight()
    const widthScale = pageWidth / parseInt(element.getAttribute('width'))
    const heightScale = pageHeight / parseInt(element.getAttribute('height'))
    const scale = Math.min(widthScale, heightScale)
    element.setAttribute('width', (parseInt(element.getAttribute('width')) * scale).toString())
    element.setAttribute('height', (parseInt(element.getAttribute('height')) * scale).toString())
    console.log({ element, pageWidth, pageHeight, widthScale, heightScale, scale })
    this.doc.svg(element, {
      x: 10,
      y: 10,
      width: pageWidth,
      height: pageHeight
    }).then(() => {
      const pages = this.doc.internal.pages
      console.log({ pages })
      this.doc.save(fileName.split('/')[1].split('.')[0].concat('.pdf'))
    }).catch((err) => {
      console.log(err)
    })
    // const options = {
    //   filename: fileName.split('/')[1].split('.')[0].concat('.pdf')
    // }
    // downloadPdf(element, options, function(t) {
    //   console.log({ t })
    // })
  }
}

class ImageUmlDownloadStrategy implements IUmlDownloadStrategy {
  public download (uml: string, fileName: string): void {
    const svg = new Blob([uml], { type: 'image/svg+xml;charset=utf-8' })
    const Url = window.URL || window.webkitURL
    const url = Url.createObjectURL(svg)
    const img = document.createElement('img')
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      const scale = window.devicePixelRatio*1
      canvas.style.width = `${Math.round(img.naturalWidth/scale)}`.concat('px')
      canvas.style.height = `${Math.round(img.naturalHeight/scale)}`.concat('px')
      canvas.style.margin = '0'
      canvas.style.padding = '0'
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      ctx.drawImage(img, 0, 0, Math.round(img.naturalWidth/scale), Math.round(img.naturalHeight/scale))
      const png = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.download = fileName.split('/')[1].split('.')[0].concat('.png')
      a.href = png
      console.log('about to click the link to download the png!!!')
      a.click()
    }
    img.src = url
  }
}

export class UmlDownloadContext {
  private strategy: IUmlDownloadStrategy

  private setStrategy (strategy: IUmlDownloadStrategy): void {
    this.strategy = strategy
  }

  public download (uml: string, fileName: string, fileType: UmlFileType ): void {
    if (fileType === 'pdf') {
      this.setStrategy(new PdfUmlDownloadStrategy(jsPdf))
    } else if (fileType === 'png') {
      this.setStrategy(new ImageUmlDownloadStrategy())
    } else {
      throw new Error('Invalid file type')
    }
    this.strategy.download(uml, fileName)
  }
}