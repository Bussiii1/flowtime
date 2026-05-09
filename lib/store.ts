'use client'

import { createConnectedStore } from 'undux'

type State = {
  isSidebarOpen: boolean
  isGlobalLoading: boolean
  activeStaffFilter: string
}

const initialState: State = {
  isSidebarOpen: false,
  isGlobalLoading: false,
  activeStaffFilter: 'all'
}

export const Store = createConnectedStore(initialState)

export const { Container, useStore, withStore } = Store
