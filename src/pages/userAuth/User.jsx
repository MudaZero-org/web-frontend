import { useState, useEffect } from "react";

import SignIn from "./SignIn";
import SignUp from "./SignUp";

const User = (props) => {
	// const { setCurrentView } = props;

	const [currentView, setCurrentView] = useState("signin");

	useEffect(() => {
		if (!localStorage.getItem("user")) {
			console.log("HI!")
			return setCurrentView(<SignIn setCurrentView={setCurrentView} />);
		}

		console.log("HI!")

		// else {
		//   setUserView("profile")
		// }
	}, []);

	return (
		<div>
			{currentView}
			HELLO WORLD
		</div>
	);
};

export default User;
