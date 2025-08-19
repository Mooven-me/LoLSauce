import React from 'react'
import { Button, Card, Col, Form, FormGroup, Input, Label } from 'reactstrap'
import LoadingButton from '../../utils/LoadingButton'
import { sendData } from '../../utils/utils'
import { useNavigate } from 'react-router-dom'

export default function Login(props) {
    const navigate = useNavigate()
    const [loading, setLoading] = React.useState(false)
    const [form, setForm] = React.useState({
        email: { valid: false, invalid: false, data: '' },
        password: { valid: false, invalid: false, data: '' }
    })

    // Simplified validation function (fixed typo: verifiy -> verify)
    const verifyForm = () => {
        let formCopy = {...form}
        let allGood = true

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formCopy.email.data || !emailRegex.test(formCopy.email.data)) {
            formCopy.email.invalid = true
            formCopy.email.valid = false
            allGood = false
        } else {
            formCopy.email.invalid = false
            formCopy.email.valid = true
        }

        if (!formCopy.password.data || formCopy.password.data.length < 6) {
            formCopy.password.invalid = true
            formCopy.password.valid = false
            allGood = false
        } else {
            formCopy.password.invalid = false
            formCopy.password.valid = true
        }

        setForm(formCopy)
        return allGood
    }

    const handleInputChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                data: value,
                valid: false,
                invalid: false
            }
        }))
    }

    const handleFormSubmit = (e) => {
        if (loading) return

        if (verifyForm()) {
            setLoading(true)

            const formData = {
                username: form.username.data,
                email: form.email.data,
                password: form.password.data
            }
            
            sendData({ route: '/create', data: formData, baseURL: 'auth'}).then((data) => {
                navigate('/')
            })
        }
    }

    return (
        <div className='d-flex justify-content-center align-items-center h-100'>
            <div 
                className='position-absolute top-0' 
                style={{ fontSize: "10vw", marginTop: "50px" }}
            >
                LoLSauce
            </div>
            
            <Card 
                className='text-white position-absolute p-4' 
                style={{ fontWeight: 600, backgroundColor: "rgb(107, 114, 150)" }}
            >
                <div className='d-flex flex-column align-items-center'>                    
                    <FormGroup>
                        <Label>Email</Label>
                        <Input
                            valid={form.email.valid}
                            invalid={form.email.invalid}
                            type="email"
                            placeholder="email..."
                            value={form.email.data}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                    </FormGroup>
                    
                    <FormGroup>
                        <Label>Mot de passe</Label>
                        <Input
                            valid={form.password.valid}
                            invalid={form.password.invalid}
                            type="password"
                            placeholder="mot de passe..."
                            value={form.password.data}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                        />
                    </FormGroup>
                    
                    <LoadingButton 
                        color='info' 
                        className='text-white mt-2 w-100' 
                        onClick={handleFormSubmit}
                        loading={loading}
                        type="submit"
                    >
                        Connexion
                    </LoadingButton>
                </div>
            </Card>
        </div>
    )
}