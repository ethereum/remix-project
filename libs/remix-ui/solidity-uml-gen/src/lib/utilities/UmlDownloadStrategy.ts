interface IUmlDownloadStrategy {
  download (uml: string, fileName: string): void
}

export type UmlFileType = 'pdf' | 'png'

class PdfUmlDownloadStrategy implements IUmlDownloadStrategy {

  public download (uml: string, fileName: string): void {
    const svg = new Blob([uml], { type: 'image/svg+xml;charset=utf-8' })
    const Url = window.URL || window.webkitURL
    const url = Url.createObjectURL(svg)
    const img = document.createElement('img')
    let doc
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      const scale = window.devicePixelRatio*1
      const canvasWidth = Math.round(img.naturalWidth/scale)
      const canvasHeight = Math.round(img.naturalHeight/scale)
      canvas.style.width = `${canvasWidth}px`
      canvas.style.height = `${canvasHeight}px`
      canvas.style.margin = '0'
      canvas.style.padding = '0'
      const orientation =  canvasWidth > canvasHeight ? 'landscape' : 'portrait'
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      ctx.drawImage(img, 0, 0, Math.round(img.naturalWidth/scale), Math.round(img.naturalHeight/scale))
      if (doc === null || doc === undefined) {
        const { default: jsPDF } = await import('jspdf')
        doc = new jsPDF(orientation, 'px', [img.naturalHeight, img.naturalWidth], true)
      }
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.addImage(canvas.toDataURL('image/png',0.5), 'PNG', 0, 0, pageWidth, pageHeight)
      doc.save(`${fileName}.pdf`)
    }
    img.src = url
    doc = null
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
      a.download = `${fileName}.png`
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
      this.setStrategy(new PdfUmlDownloadStrategy())
    } else if (fileType === 'png') {
      this.setStrategy(new ImageUmlDownloadStrategy())
    } else {
      throw new Error('Invalid file type')
    }
    this.strategy.download(uml, fileName)
  }
}