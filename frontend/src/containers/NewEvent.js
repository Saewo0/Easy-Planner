import React, { Component } from "react"
import { Button, Form } from 'react-bootstrap'
import DateTimePicker from 'react-datetime-picker'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { API } from "aws-amplify";
import './NewEvent.css'

class NewEvent extends Component {
    constructor(props) {
        super(props)
        console.log(props)
        this.state = {
            eventStartDateTime: new Date(),
            eventEndDateTime: new Date(),
            eventHost: props.userEmail,
            eventParticipants: [],
            usersFriends: [ 
                {name: "Loading...", email: "xxx"},
            ],
            validated: false
        }
        this.handleStartDatetimeChange = this.handleStartDatetimeChange.bind(this)
        this.handleEndDatetimeChange = this.handleEndDatetimeChange.bind(this)
        this.handleParticipantChange = this.handleParticipantChange.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    handleSubmit = async event => {
        const form = event.currentTarget;
        
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const newEvent = {
            eventName: form.elements.eventName.value,
            eventDestination: form.elements.eventDestination.value,
            eventDestinationId: form.elements.eventDestinationId.value,
            eventStartDateTime: this.state.eventStartDateTime.toISOString(),
            eventEndDateTime: this.state.eventEndDateTime.toISOString(),
            eventHost: this.state.eventHost,
            eventParticipants: this.state.eventParticipants,
        }
        console.log(newEvent)
        
        try {
            await this.createEvent(newEvent)
            this.props.history.push("/");
        } catch (e) {
            alert(e);
        }
        this.setState({ validated: true });
    }
    
    createEvent(newEvent) {
        return API.put("Easyplanner", "/event", {
            body: newEvent
        });
    }
    
    handleChange = event => {
        const {name, value} = event.currentTarget
        this.setState({
            [name]: value
        })
    }

    handleParticipantChange = event => {
        this.setState({
            eventParticipants: [].slice.call(event.currentTarget.selectedOptions).map(o => o.value)
        });
    }

    handleStartDatetimeChange = datetime => this.setState({ eventStartDateTime: datetime})
    handleEndDatetimeChange = datetime => this.setState({ eventEndDateTime: datetime})
    
    componentDidMount() {
        this.getFriends()
    }

    async getFriends() {
        try {
            const response = await API.get('Easyplanner', '/search?q='+this.state.eventHost)
            console.log('data from Lambda REST API: ', response.body)
            this.setState({
                usersFriends: response.body
            })
        } catch (err) {
            console.log('error fetching data..', err)
        }
    }

    renderLander() {
        return (
            <div className="lander">
                <h1>Easy Planner</h1>
                <p>Please login to try our service</p>
            </div>
        );
    }

    renderForms() {
        const { validated } = this.state;
        const friends = this.state.usersFriends.map(person => <option key={person.email} value={person.email}>{person.name}</option>)
        return (
            <div>
                <h1 className="page-header"> Create Event</h1>
                <Form
                    noValidate
                    validated={validated}
                    onSubmit={e => this.handleSubmit(e)}
                >
                    <Form.Group controlId="validationEventName">
                        <Form.Label>Event Name</Form.Label>
                        <Form.Control
                            required
                            name="eventName"
                            onChange={this.handleChange}
                            type="text"
                            placeholder="name"
                        />
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Destination</Form.Label>
                        <Form.Control
                            required
                            id="eventDest"
                            name="eventDestination"
                            type="text"
                            placeholder="destination"
                        />
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Destination ID</Form.Label>
                        <Form.Control
                            readOnly
                            required
                            id="eventDestID"
                            name="eventDestinationId"
                            type="text"
                            placeholder="destination id"
                        />
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="validationeventStartDateTime">
                        <Form.Label>Start Date & Time</Form.Label>
                        <br />
                        <DateTimePicker
                            onChange={this.handleStartDatetimeChange}
                            value={this.state.eventStartDateTime}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="validationeventEndDateTime">
                        <Form.Label>End Date & Time</Form.Label>
                        <br />
                        <DateTimePicker
                            onChange={this.handleEndDatetimeChange}
                            value={this.state.eventEndDateTime}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="validationParticipants">
                        <Form.Label>Participants</Form.Label>
                        <Form.Control as="select" multiple required onChange={this.handleParticipantChange}>
                            {friends}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                            Please choose at least one participant.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Button type="submit"><FontAwesomeIcon icon={faPaperPlane} /> Create & Send</Button>
                </Form>
            </div>
        )
    }

    render() {
        console.log(this.props)
        return (
            <div className="NewEvent">
                {this.props.isAuthenticated ? this.renderForms() : this.renderLander()}
            </div>
        );
    }
}

export default NewEvent;