// Analytics fully removed: provide no-op functions to keep call sites intact
export const initAnalytics = () => {}
export const debugAnalytics = () => {}
export const optOutAnalytics = () => {}
export const optInAnalytics = () => {}
export const trackEvent = (_eventName, _properties) => {}
