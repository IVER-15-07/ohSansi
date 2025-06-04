"use client"

import { useState, useCallback } from "react"

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }))

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }))
      }
    },
    [errors],
  )

  const setFieldTouched = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
  }, [])

  const validate = useCallback(() => {
    const newErrors = {}

    Object.keys(validationRules).forEach((field) => {
      const rules = validationRules[field]
      const value = values[field]

      if (rules.required && (!value || value.toString().trim() === "")) {
        newErrors[field] = rules.required
      } else if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.patternMessage || "Formato inválido"
      } else if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `Mínimo ${rules.minLength} caracteres`
      } else if (rules.maxLength && value && value.length > rules.maxLength) {
        newErrors[field] = `Máximo ${rules.maxLength} caracteres`
      } else if (rules.custom && value) {
        const customError = rules.custom(value, values)
        if (customError) {
          newErrors[field] = customError
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [values, validationRules])

  const handleSubmit = useCallback(
    async (onSubmit) => {
      setIsSubmitting(true)

      // Mark all fields as touched
      const allTouched = {}
      Object.keys(validationRules).forEach((field) => {
        allTouched[field] = true
      })
      setTouched(allTouched)

      if (validate()) {
        try {
          await onSubmit(values)
        } catch (error) {
          console.error("Form submission error:", error)
        }
      }

      setIsSubmitting(false)
    },
    [values, validate, validationRules],
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validate,
    handleSubmit,
    reset,
  }
}
