import React from 'react'
import {  Card, FormGroup, Input, Label } from 'reactstrap'
import LoadingButton from '../../utils/LoadingButton'
import { sendData } from '../../utils/utils'
import { useNavigate } from 'react-router-dom'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = React.useState({
        username: { valid: false, invalid: false, data: '' },
        email: { valid: false, invalid: false, data: '' },
        password: { valid: false, invalid: false, data: '' }
    })

    // Simplified validation function (fixed typo: verifiy -> verify)
    const verifyForm = () => {
        let formCopy = {...form}
        let allGood = true

        if (!formCopy.username.data || formCopy.username.data.trim().length === 0) {
            formCopy.username.invalid = true
            formCopy.username.valid = false
            allGood = false
        } else {
            formCopy.username.invalid = false
            formCopy.username.valid = true
        }

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

    const handleFormSubmit = async () => {
        if (verifyForm()) {
            const formData = {
                username: form.username.data,
                email: form.email.data,
                password: form.password.data
            }
            
            return sendData({ route: '/register', data: formData, basePath: 'auth'}).then((data) => {
                if(!data.error){
                    window.IS_LOGGED_IN = data.is_logged_in
                    window.USERNAME = data.username
                    window.ROLENAME = data.role
                    navigate('/')
                }else if(data.error_type === "email"){
                    let formCopy = {...form}
                    setForm({...formCopy, email: {valid: false, invalid: true, data: formCopy.email.data }})
                }
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
                className='text-white position-absolute p-4 opaque-grey border-grey'
                style={{ fontWeight: 600}}
            >
                <div className='d-flex flex-column align-items-center'>
                    <FormGroup>
                        <Label>Pseudo</Label>
                        <Input
                            className={"opaque-light-blue placeholder-white placeholder-grey"}
                            valid={form.username.valid}
                            invalid={form.username.invalid}
                            type="text"
                            placeholder="pseudo..."
                            value={form.username.data}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                        />
                    </FormGroup>
                    
                    <FormGroup>
                        <Label>Email</Label>
                        <Input
                            className={"opaque-light-blue placeholder-white placeholder-grey"}
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
                            className={"opaque-light-blue placeholder-white placeholder-grey"}
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
                        className='text-white mt-2 w-100 opaque-light-blue justify-content-center'
                        onClick={handleFormSubmit}
                        type="submit"
                    >
                        S'inscrire
                    </LoadingButton>
                </div>
            </Card>
        </div>
    )
}