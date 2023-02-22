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
    const element = parsedDocument.getElementsByTagName('svg')[0]
    this.doc.svg(element, {
      x: 20,
      y: 20,
      width: this.doc.internal.pageSize.getWidth() - 20,
      height: this.doc.internal.pageSize.getHeight() - 40
    }).then(() => {
      this.doc.save(fileName.split('/')[1].split('.')[0].concat('.pdf'))
    }).catch((err) => {
      console.log(err)
    })
  }
}

class ImageUmlDownloadStrategy implements IUmlDownloadStrategy {
  public download (uml: string, fileName: string): void {
    const svg = new Blob([uml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svg)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const png = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.download = fileName.split('/')[1].split('.')[0].concat('.png')
      a.href = png
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