import React, { useContext, useEffect } from "react";
import { BsTwitter } from "react-icons/bs";
import UserSignUp from "../components/dialogs/UserSignup";
import AppContext from "../../src/components/utils/AppContext";
import { gql, useMutation } from "@apollo/client";

const SAVE_USER_DATA = gql`
	mutation SaveUserData($profile: UserProfileInput!) {
		saveUserData(profile: $profile) {
			id
			name
			email
		}
	}
`;

export const SignUpPage = () => {
	const { magic } = useContext(AppContext);
	const [signUpWithMagic] = useMutation(SAVE_USER_DATA);

	if (!magic) {
		throw new Error("Magic instance not found");
	}

	useEffect(() => {
		const fetchData = async () => {
			const result = await (magic.oauth as any).getRedirectResult();
			const profile = {
				name: result.oauth.name,
				email: result.oauth.email,
				familyName: result.oauth.familyName,
				givenName: result.oauth.givenName,
				picture: result.oauth.picture,
			};

			// Send the profile data to the backend
			await signUpWithMagic({
				variables: { profile },
			});
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
