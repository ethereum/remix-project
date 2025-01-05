import { FileManager } from '../fileManager'

describe('FileManager', () => {
  describe('validatePath', () => {
    let fileManager

    beforeEach(() => {
      fileManager = new FileManager()
    })

    it('should reject null/undefined paths', () => {
      expect(fileManager.validatePath(null)).toBe(false)
      expect(fileManager.validatePath(undefined)).toBe(false)
    })

    it('should reject path traversal attempts', () => {
      expect(fileManager.validatePath('../test.sol')).toBe(false)
      expect(fileManager.validatePath('folder/../test.sol')).toBe(false)
    })

    it('should reject paths with special characters', () => {
      expect(fileManager.validatePath('test?.sol')).toBe(false)
      expect(fileManager.validatePath('test*.sol')).toBe(false)
    })

    it('should reject too long paths', () => {
      const longPath = 'a'.repeat(256)
      expect(fileManager.validatePath(longPath)).toBe(false)
    })

    it('should accept valid paths', () => {
      expect(fileManager.validatePath('contracts/test.sol')).toBe(true)
      expect(fileManager.validatePath('folder/subfolder/test.sol')).toBe(true)
    })
  })
}) 
