import React from 'react'
import { useAuth } from '../../auth/AuthContext'
import logo from '../../../../src/assets/greenchoice.svg'
import './InitialHello.css'

const InitialHello: React.FC = () => {
	const { user } = useAuth()
	const name = user?.name ?? 'there'

	return (
		<div className="initial-hello">
			<img src={logo} alt="GreenChoice" className="initial-hello-logo" />
			<div className="initial-hello-text">
				<div className="initial-hello-title">Welcome back, {name}!</div>
				<div className="initial-hello-sub">How can I help you make greener choices today?</div>
			</div>
		</div>
	)
}

export default InitialHello
