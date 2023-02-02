import axios from "axios";
import "../../styles/pages/_profilePage.scss";
import { useEffect, useState } from "react";
import API_URL from "../../Constants";
import { useNavigate } from "react-router-dom";
import storage from "../../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const EditProfile = () => {
	const navigate = useNavigate(null);

	const [storeName, setStoreName] = useState(null);
	const [postalCode, setPostalCode] = useState(null);
	const [companyName, setCompanyName] = useState(null);
	const [storeAddress, setStoreAddress] = useState(null);
	const [phoneNumber, setPhoneNumber] = useState(null);
	const [storeManager, setStoreManager] = useState(null);
	const [image, setImage] = useState(null);
	const user = JSON.parse(localStorage.getItem("user"));

	const [file, setFile] = useState("");
	function handleChange(event) {
		setFile(event.target.files[0]);
	}
	const [percent, setPercent] = useState(0);

	const handleUpload = () => {
		if (!file) {
			alert("Please choose a file first!")
		}
		const storageRef = ref(storage, `/files/${file.name}`);
		const uploadTask = uploadBytesResumable(storageRef, file);

		uploadTask.on(
			"state_changed",
			(snapshot) => {
				const percent = Math.round(
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100
				);

				setPercent(percent);
			},
			(err) => console.log(err),
			() => {
				getDownloadURL(uploadTask.snapshot.ref).then((url) => {
					console.log(url);
				})
			}
		)
	}

	useEffect(() => {
		async function fetchUserData() {
			const userID = user.data.storeId;
			const userData = await axios.get(`${API_URL}/user/${userID}`, {
				headers: { authorization: `Bearer ${user.accessToken}` },
			});

			setStoreName(userData.data.storeName);
			// setEmail(user.data.email);
			// setImage(user.data.profileImg);
		}

		fetchUserData();
	}, []);

	const handleSubmit = async (e) => {
		//Update store name and/or email address
		e.preventDefault();
		console.log("Submit");
		console.log(storeName, image);
		await axios.put(
			`${API_URL}/user/${user.data.storeId}`,
			{
				storeName: storeName,
				postalCode: postalCode,
				companyName: companyName,
				storeAddress: storeAddress,
				phoneNumber: phoneNumber,
				storeManager: storeManager,
				profileImg: image,
			},
			{
				headers: { authorization: `Bearer ${user.accessToken}` },
			}
		);
		navigate("/profile");
	};

	return (
		<div className="profile-page">
			<div className="card" id="profile-card">
				<div className="card-content">
					<form className="form">
						<h1>Edit Profile</h1>
						<hr></hr>
						<div className="field">
							<label className="label">Store name</label>
							<div className="control">
								<input
									className="input"
									type="text"
									placeholder={storeName}
									onChange={(e) => {
										setStoreName(e.target.value);
									}}
								></input>
							</div>
						</div>
						<div className="field">
							<label className="label">Company name</label>
							<div className="control">
								<input
									className="input"
									type="text"
									placeholder=""
									onChange={(e) => {
										setCompanyName(e.target.value);
									}}
								></input>
							</div>
						</div>
						<div className="field">
							<label className="label">Postal code</label>
							<div className="control">
								<input
									className="input"
									type="text"
									placeholder=""
									onChange={(e) => {
										setPostalCode(e.target.value);
									}}
								></input>
							</div>
						</div>
						<div className="field">
							<label className="label">Store address</label>
							<div className="control">
								<input
									className="input"
									type="text"
									placeholder=""
									onChange={(e) => {
										setStoreAddress(e.target.value);
									}}
								></input>
							</div>
						</div>
						<div className="field">
							<label className="label">Phone number</label>
							<div className="control">
								<input
									className="input"
									type="text"
									placeholder=""
									onChange={(e) => {
										setPhoneNumber(e.target.value);
									}}
								></input>
							</div>
						</div>
						<div className="field">
							<label className="label">Store Manager</label>
							<div className="control">
								<input
									className="input"
									type="text"
									placeholder=""
									onChange={(e) => {
										setStoreManager(e.target.value);
									}}
								></input>
							</div>
						</div>
						<div className="field">
							<label className="label">Image</label>
							<div className="control">
								<input
									className="input"
									type="text"
									placeholder=""
									onChange={(e) => {
										setImage(e.target.value);
									}}
								></input>
							</div>
						</div>

						<div>
							<input type="file" accept="/image/*" onChange={handleChange}></input>
							<button onClick={handleUpload}>Upload Picture</button>
							<p>{percent}% done</p>
						</div>

						<div className="field is-grouped">
							<div className="control">
								<button
									className="button is-success"
									onClick={(e) => {
										handleSubmit(e);
									}}
								>
									Update
								</button>
							</div>
							<div className="control">
								<button
									className="button is-link is-light"
									onClick={(e) => {
										navigate("/profile");
									}}
								>
									Cancel
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default EditProfile;
