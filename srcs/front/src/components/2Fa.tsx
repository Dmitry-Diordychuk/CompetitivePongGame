import {useAuth} from "../auth/auth.context";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Alert, Button, Card, Form, Stack} from "react-bootstrap";

export default function SecondFa() {
    const [code, setCode] = useState<string>('');
    const auth = useAuth();
    const navigate = useNavigate();

    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    if (!auth.user) {
        navigate('/login', {replace: true});
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        auth.secondFactorAuthenticate(
            code,
            ()=> {
                navigate("/settings", {replace: true});
            },
            (message: string)=> {
                setMessage(message);
                setAlertVariant('danger');
            },
        )
    }

    return (
        <Card style={{ width: '18rem' }}>
            <Card.Body>
                <Card.Title>Second factor login</Card.Title>
                <Card.Text>Enter code</Card.Text>
                <Alert show={message !== ''} variant={alertVariant}>{message}</Alert>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Stack direction="horizontal" gap={3}>
                            <Form.Control
                                className="me-auto"
                                placeholder="000000"
                                onChange={(event: any) => {
                                    setCode(event.target.value)
                                }}
                            />
                            <Button onClick={handleSubmit} variant="success">Login</Button>
                        </Stack>
                    </Form.Group>
                </Form>
                <Button onClick={() => navigate('/login')} variant="primary">Back</Button>
            </Card.Body>
        </Card>
    );
}