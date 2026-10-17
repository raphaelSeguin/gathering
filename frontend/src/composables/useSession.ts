const USER_ID_KEY = 'userId'

export function useSession() {
  function getUserId(): string | null {
    return sessionStorage.getItem(USER_ID_KEY)
  }

  function setUserId(userId: string): void {
    sessionStorage.setItem(USER_ID_KEY, userId)
  }

  function clear(): void {
    sessionStorage.removeItem(USER_ID_KEY)
  }

  return { getUserId, setUserId, clear }
}
