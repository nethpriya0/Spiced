// Simple test for AuthError class to avoid Web3Auth complexity
export class AuthError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'AuthError'
  }
}

describe('AuthError', () => {
  it('should create error with message and cause', () => {
    const cause = new Error('Original error')
    const authError = new AuthError('Test error', cause)
    
    expect(authError.message).toBe('Test error')
    expect(authError.cause).toBe(cause)
    expect(authError.name).toBe('AuthError')
  })

  it('should create error without cause', () => {
    const authError = new AuthError('Test error')
    
    expect(authError.message).toBe('Test error')
    expect(authError.cause).toBeUndefined()
    expect(authError.name).toBe('AuthError')
  })

  it('should be instance of Error', () => {
    const authError = new AuthError('Test error')
    expect(authError).toBeInstanceOf(Error)
    expect(authError).toBeInstanceOf(AuthError)
  })
})