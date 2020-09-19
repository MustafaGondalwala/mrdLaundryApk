import * as ActionTypes from './ActionTypes';

export const subTotal = (data) => ({
    type: ActionTypes.SUB_TOTAL,
    data: data
})

export const total = (data) => ({
    type: ActionTypes.TOTAL,
    data: data
})

export const promo = (data) => ({
    type: ActionTypes.PROMO,
    data: data
})

export const calculatePricing = () => ({
    type: ActionTypes.CALCULATE_PRICING,
})

export const selectAddress = (data) => ({
    type: ActionTypes.SELECT_ADDRESS,
    data: data
})
export const selectDeliveryTime = (data) => ({
    type: ActionTypes.SELECT_DELIVERY_TIME,
    data: data
})

export const selectPickUpTime = (data) => ({
    type: ActionTypes.SELECT_PICKUP_TIME,
    data: data
})
export const selectPickUpDate = (data) => ({
    type: ActionTypes.SELECT_PICKUP_DATE,
    data: data
})

export const selectDate = (data) => ({
    type: ActionTypes.SELECT_DATE,
    data: data
})

export const reset = () => ({
    type: ActionTypes.RESET,
})

