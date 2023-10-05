import React, { useContext, useEffect } from "react";
import { BsTwitter } from "react-icons/bs";
import UserSignUp from "../components/dialogs/UserSignup";
import AppContext from "../../src/components/utils/AppContext";

export const SignUpPage = () => {
	const { magic } = useContext(AppContext);
	let profile = {};

	useEffect(() => {
		const fetchData = async () => {
			const result = await (magic.oauth as any).getRedirectResult();
			console.log(result);
			const profile = JSON.stringify(result.oauth.userInfo, undefined, 2);
			console.log(profile);
		};
		fetchData();
	}, [magic.oauth]);

	return (
		<div>
			<span>Profile</span>
		</div>
	);
};

export default SignUpPage;
