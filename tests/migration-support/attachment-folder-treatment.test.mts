import { describe, it, expect } from 'vitest'
import path from 'path'
import {
  createAttachmentFolderPolicyWithSubfolder,
  createAttachmentFolderPolicyWithoutSubfolder,
  calculateAttachmentFolderPath,
} from '../../src/migration-support/attachment-folder-treatment.mjs'

describe('createAttachmentFolderPolicyWithSubfolder', () => {
  it('creates subfolderUnderVault policy with subfolder name', () => {
    const policy = createAttachmentFolderPolicyWithSubfolder('subfolderUnderVault', '_attachments')
    expect(policy).toEqual({ type: 'subfolderUnderVault', subfolderName: '_attachments' })
  })

  it('creates subfolderUnderEachFolder policy with subfolder name', () => {
    const policy = createAttachmentFolderPolicyWithSubfolder('subfolderUnderEachFolder', 'assets')
    expect(policy).toEqual({ type: 'subfolderUnderEachFolder', subfolderName: 'assets' })
  })
})

describe('createAttachmentFolderPolicyWithoutSubfolder', () => {
  it('creates vaultFolder policy', () => {
    const policy = createAttachmentFolderPolicyWithoutSubfolder('vaultFolder')
    expect(policy).toEqual({ type: 'vaultFolder' })
  })

  it('creates sameFolderAsEachFile policy', () => {
    const policy = createAttachmentFolderPolicyWithoutSubfolder('sameFolderAsEachFile')
    expect(policy).toEqual({ type: 'sameFolderAsEachFile' })
  })
})

describe('calculateAttachmentFolderPath', () => {
  const rootPath = '/vault'
  const currentFolderPath = '/vault/notebooks/daily'

  it('returns root path for vaultFolder policy', () => {
    const policy = createAttachmentFolderPolicyWithoutSubfolder('vaultFolder')
    expect(calculateAttachmentFolderPath(rootPath, currentFolderPath, policy)).toBe(rootPath)
  })

  it('returns subfolder under root for subfolderUnderVault policy', () => {
    const policy = createAttachmentFolderPolicyWithSubfolder('subfolderUnderVault', '_attachments')
    expect(calculateAttachmentFolderPath(rootPath, currentFolderPath, policy)).toBe(
      path.join(rootPath, '_attachments')
    )
  })

  it('returns current folder for sameFolderAsEachFile policy', () => {
    const policy = createAttachmentFolderPolicyWithoutSubfolder('sameFolderAsEachFile')
    expect(calculateAttachmentFolderPath(rootPath, currentFolderPath, policy)).toBe(currentFolderPath)
  })

  it('returns subfolder under current folder for subfolderUnderEachFolder policy', () => {
    const policy = createAttachmentFolderPolicyWithSubfolder('subfolderUnderEachFolder', 'assets')
    expect(calculateAttachmentFolderPath(rootPath, currentFolderPath, policy)).toBe(
      path.join(currentFolderPath, 'assets')
    )
  })
})
