import React, { Component } from "react";
import { ListGroup,  Button, Row, Col } from "react-bootstrap";
import { API } from "aws-amplify";
import "./Home.css";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true, 
            user: props.userEmail,
            allEvents: [],
            something: true
        };
    }

    componentDidMount() {
        this.getEevents()
    }
    
    getEevents = async() => {
        try {
            const response = await API.get('Easyplanner', '/event?q='+this.state.user)
            this.setState({
                allEvents: response.body
            })
        } catch (err) {
            console.log('error fetching data..', err)
        }
        this.setState({ isLoading: false });
    }

    async join(eventId, user) {
        const response = await API.del('Easyplanner', '/event?q='+user+","+eventId)
        console.log('data from Lambda REST API: ', response)
        this.setState({something: false})
    }

    renderEventsList(events) {
        return [].concat(events).map((event) =>
                <ListGroup.Item key={event.eventID}>
                    <Row>
                        <Col md={2}>
                            <h3>{event.eventName}</h3>
                        </Col>
                        <Col>
                            <Row> {"@ " + event.eventDestination} </Row>
                            <Row> {"from:  " + event.eventHost + " starting at  " + event.eventStartDateTime} </Row>
                            <Row> {"Participants:  " + event.eventParticipants.map(p => " " + p)} </Row>
                        </Col>
                        <Col md={2}>
                            {event.isPending && <Button onClick={() => this.join(event.eventID, this.state.user)}> Join! </Button>}
                        </Col>
                    </Row>
                </ListGroup.Item>
        );
    }

    renderLander() {
        return (
            <div className="lander">
                <h1>Easy Planner</h1>
                <p>A simple planning app</p>
            </div>
        );
    }

    renderEvents() {
        return (
            <div className="events">
                <h1 className="page-header">Your Events</h1>
                <ListGroup>
                    {!this.state.isLoading && this.renderEventsList(this.state.allEvents)}
                </ListGroup>
            </div>
        );
    }

    render() {
        return (
            <div className="Home">
                {this.state.something && <div></div>}
                {this.props.isAuthenticated ? this.renderEvents() : this.renderLander()}
            </div>
        );
    }
}