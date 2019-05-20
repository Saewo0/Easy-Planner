import React, { Component } from "react";
import { Button, Form } from "react-bootstrap";
import { Auth } from "aws-amplify";
import "./Login.css";

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: ""
        };
        this.handleChange = this.handleChange.bind(this)
    }

    validateForm() {
        return this.state.email.length > 0 && this.state.password.length > 0;
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    handleSubmit = async event => {
        event.preventDefault();
        try {
            await Auth.signIn(this.state.email, this.state.password);
            this.props.userHasAuthenticated(true);
            this.props.recordUserEmail(this.state.email)
            this.props.history.push("/");
        } catch (e) {
            alert(e.message);
        }
    }  

    render() {
        return (
            <div className="Login">
                <form onSubmit={this.handleSubmit}>
                    <Form.Group controlId="email" bssize="large">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            autoFocus
                            type="email"
                            value={this.state.email}
                            onChange={this.handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="password" bssize="large">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            value={this.state.password}
                            onChange={this.handleChange}
                            type="password"
                        />
                    </Form.Group>
                    <Button
                        block
                        bssize="large"
                        disabled={!this.validateForm()}
                        type="submit"
                    >
                        Login
                    </Button>
                </form>
            </div>
        );
    }
}