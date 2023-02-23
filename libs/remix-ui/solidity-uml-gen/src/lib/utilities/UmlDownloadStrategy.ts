import jsPDF from 'jspdf'
import 'svg2pdf.js'


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
  //   const svg = new Blob([uml], { type: 'image/svg+xml;charset=utf-8' })
  //   const url = URL.createObjectURL(svg)
  //   const img = new Image()
  //   img.onload = () => {
  //     const canvas = document.createElement('canvas')
  //     canvas.width = img.width
  //     canvas.height = img.height
  //     const ctx = canvas.getContext('2d')
  //     ctx.drawImage(img, 0, 0)
  //     const png = canvas.toDataURL('image/png')
  //     const a = document.createElement('a')
  //     a.download = fileName.split('/')[1].split('.')[0].concat('.png')
  //     a.href = png
  //     a.click()
  //   }
  //   img.src = url
  // }
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