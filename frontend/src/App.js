import React, { Component, Fragment } from 'react'
import { Auth } from "aws-amplify"
import './App.css'
import { Link } from "react-router-dom"
import { LinkContainer } from "react-router-bootstrap";
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faPlus, faUserPlus, faInbox, faSignOutAlt, faSignInAlt} from "@fortawesome/free-solid-svg-icons"
import Routes from "./Routes"


class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userEmail: null,
            isAuthenticated: false,
            isAuthenticating: true
        }
    }
    
    async componentDidMount() {
        console.log("check auth currentSession...")
        try {
            var r = await Auth.currentSession();
            console.log(r)
            this.userHasAuthenticated(true);
        }
        catch(e) {
            console.log(e)
            if (e !== 'No current user') {
                alert(e);
            }
        }
      
        this.setState({ isAuthenticating: false });
    }

    userHasAuthenticated = authenticated => {
        this.setState({ isAuthenticated: authenticated });
    }

    recordUserEmail = email => {
        console.log("recordUserEmail called " + email)
        this.setState({ userEmail: email });
    }

    handleLogout = async event => {
        await Auth.signOut();
        this.userHasAuthenticated(false);
    }

    render() {
        const childProps = {
            isAuthenticated: this.state.isAuthenticated,
            userEmail: this.state.userEmail,
            userHasAuthenticated: this.userHasAuthenticated,
            recordUserEmail: this.recordUserEmail
        };
        return (
            !this.state.isAuthenticating &&
            <div className="App">
                <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                    <Navbar.Brand>
                      <Link to="/">
                        <FontAwesomeIcon icon={faHome} /> Home
                      </Link>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="mr-auto">
                            <LinkContainer to="/">
                                <Nav.Link>My Events</Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/new">
                                <Nav.Link><FontAwesomeIcon icon={faPlus} /> Create Event</Nav.Link>
                            </LinkContainer>
                            <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
                                <NavDropdown.Item href="#action/3.1"><FontAwesomeIcon icon={faUserPlus} /> Add friends</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        <Nav>
                            <Nav.Link href="#pending"><FontAwesomeIcon icon={faInbox} /> Pending Requests</Nav.Link>
                            {
                                this.state.isAuthenticated ?
                                <Nav.Link onClick={this.handleLogout}><FontAwesomeIcon icon={faSignOutAlt} /> Sign Out</Nav.Link> :
                                <Fragment>
                                    <Nav.Link href="/signup"><FontAwesomeIcon icon={faUserPlus} /> Sign Up</Nav.Link>
                                    <Nav.Link href="/login"><FontAwesomeIcon icon={faSignInAlt} /> Sign In</Nav.Link>
                                </Fragment>
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Routes childProps={childProps}/>
            </div>
        );
    }
}

export default App;
