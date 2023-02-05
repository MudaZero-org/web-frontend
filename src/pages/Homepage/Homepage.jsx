import axios from "axios";
import MealPackModal from "./MealPackModal";
import { useState, useEffect, useRef } from "react";
import "../../styles/pages/_homepage.scss";
import { v4 as uuidv4 } from 'uuid';
import API_URL from "../../Constants";
import vegetarianArr from "./utils/vegetarian.json";
import dairyFreeArr from "./utils/dairyFree.json";
import glutenFreeArr from "./utils/glutenFree.json";
import { Popover, OverlayTrigger } from 'react-bootstrap';

//Utils for homepage
import HomepageUtils from "./utils/homepageUtils"

//Quick Guide Modal
import QuickGuide from "./QuickGuide"


const Homepage = (props) => {
	const {
		selectedActivePack,
		setSelectedActivePastPack,
		activeMealPacks,
		setActiveMealPacks,
		pastMealPacks,
		setPastMealPacks,
		//Added showGuide and firstLogIn
		showGuide,
		setShowGuide,
		firstLogIn,
		setFirstLogIn,
		setImage
	} = props;
	
	
	//Added ref and index
	const [index, setIndex] = useState(0);
	const [text, setText] = useState(null);
	const [filteredText, setFilteredText] = useState(null);
	const [ingredientArr, setIngredientArr] = useState([]);
	const [filteredArr, setFilteredArr] = useState([]);
	const [mealPacks, setMealPacks] = useState(null);
	const isMounted = useRef(false);
	const [show, setShow] = useState(false);
	const [selectedMealPack, setSelectedMealPack] = useState(null);
	const [myMealPacks, setMyMealPacks] = useState([]);

	const [ingredientInput, setIngredientInput] = useState(null);
	const [ingredientInputArr, setIngredientInputArr] = useState([]);
	const [filteredInput, setFilteredInput] = useState(null);
	const [filteredInputArr, setFilteredInputArr] = useState([]);
	const [buttonStatus, setButtonStatus] = useState(true);
	const [successfulSave, setSuccessfulSave] = useState(false);

	const [userFilterLists, setUserFilterLists] = useState([]);
	const [filterListSaved, setFilterListSaved] = useState(false);
	const [filterListName, setFilterListName] = useState("")

	const user = JSON.parse(localStorage.getItem("user"));

	useEffect(() => {
		setFilterListSaved(false)
	}, [filteredInputArr])
	
	useEffect(() => {
		//Refactored this
		// async function fetchUserData() {
		// 	const user = JSON.parse(localStorage.getItem("user"));
		// 	const userID = user.data.storeId;
		// 	const userData = await axios.get(`${API_URL}/user/${userID}`, {
		// 		headers: { authorization: `Bearer ${user.accessToken}` },
		// 	});
		// 	setImage(userData.data.profileImg);
		// 	let response = await axios.get(`${API_URL}/store/${user.data.storeId}/filter_list`, {
		// 			headers: {authorization: `Bearer ${user.accessToken}`}
		// 		})
		// 	setUserFilterLists(response.data)
		// }
		// fetchUserData();
		HomepageUtils.fetchUserFilterData(setUserFilterLists, setImage)
	}, []);


	const makeArr = () => {
		setSuccessfulSave(false)
		let ingredientArr = [...ingredientInputArr]
		setIngredientArr(ingredientArr)
		let filteredArr = [...filteredInputArr]
		setFilteredArr(filteredArr)
	};

	useEffect(() => {
		//Refactored this
		// async function fetchData() {
		// 	if (isMounted.current) {
		// 		const data = await axios.post(`${API_URL}/mealpack/recipe`, {
		// 			ingredients: ingredientArr,
		// 			filteredWords: filteredArr,
		// 		},
		// 		{
		// 			headers: {authorization: `Bearer ${user.accessToken}`}
		// 		});
		// 		data.data.map((meal) => meal.clicked = false)
		// 		setMealPacks(data.data);
		// 		const idArray = [];
		// 		data.data.forEach((e) => idArray.push(e.id));
		// 	} else {
		// 		isMounted.current = true;
		// 	}
		// }
		// fetchData();
		HomepageUtils.generateMealPacks(isMounted, user, ingredientArr, filteredArr, setMealPacks)
	}, [ingredientArr]);

	const addToMyMealPacks = (meal) => {
		let array = [...myMealPacks];
		array.push(meal);
		setMyMealPacks(array);
	};

	const removeFromMyMealPacks = (meal) => {
		let array = [...myMealPacks];
		array.splice(array.indexOf(meal), 1);
		setMyMealPacks(array);
	};

	useEffect(() => {
		if (myMealPacks.length > 0) {
			setButtonStatus(false)
		} else {
			setButtonStatus(true)
		}
	}, [myMealPacks])

	const publishMealPacks = async () => {
		const storeId = user.data.storeId;
		const idArray = [];
		for (let e of myMealPacks) {
			idArray.push({ id: e.id });
		}
		await axios.post(`${API_URL}/store/${storeId}/mealpack`, {
			data: idArray,
		}, 
		{
			headers: {authorization: `Bearer ${user.accessToken}`}
		});
		// let info = await axios.get(`${API_URL}/store/${storeId}/mealpack/all/status/true`, {
		// 	headers: {authorization: `Bearer ${user.accessToken}`}
		// });
		// setActiveMealPacks(info.data);
	};	

	const clearIngredientInput = () => {
		let input = document.getElementById("userIngredientInput");
		input.value = "";
	}

	const clearFilteredInput = () => {
		let input = document.getElementById("userFilteredInput");
		input.value = "";
	}

	const removeIngredient = (ingredient) => {
		const arr = [...ingredientInputArr];
		arr.splice(arr.indexOf(ingredient), 1)
		setIngredientInputArr(arr)
	}

	const removeFiltered = (ingredient) => {
		const arr = [...filteredInputArr];
		arr.splice(arr.indexOf(ingredient), 1)
		setFilteredInputArr(arr)
	}

	const ingredientKeyHandler = (e) => {
		if (e.which === 13) {
			let arr = [...ingredientInputArr]
			arr.unshift(ingredientInput)
			if (ingredientInput) {
				setIngredientInputArr(arr)
				clearIngredientInput();
				setIngredientInput(null)
			}
		}
	};

	const filteredKeyHandler = (e) => {
		if (e.which === 13) {
			let arr = [...filteredInputArr]
			arr.unshift(filteredInput)
			if (filteredInput) {
				setFilteredInputArr(arr)
				clearFilteredInput();
				setFilteredInput(null)
			}
		}
	}

	// Accordion settings start #######################################
	useEffect(() => {
		let acc = document.getElementsByClassName("accordion");
		let i;
		for (i = 0; i < acc.length; i++) {
			  acc[i].addEventListener("click", function () {
			    /* Toggle between adding and removing the "active" class,
			    to highlight the button that controls the panel */
			    this.classList.toggle("active");
			
			    /* Toggle between hiding and showing the active panel */
			    let panel = this.nextElementSibling;
			    if (panel.style.display === "block") {
			      panel.style.display = "none";
			    } else {
			      panel.style.display = "block";
			    }
			  });
			}
		document.getElementsByClassName("open-default")[0].click();
	}, [])
	// According settings end #########################################


	const addFilters = (type) => {
		let arr = [...filteredInputArr]
		switch(type) {
			case "veg":
				for (let x of vegetarianArr) {
					arr.unshift(x)
				}
				setFilteredInputArr(arr)
				clearFilteredInput();
				setFilteredInput(null)
				break;
			
			case "glu":
				for (let x of glutenFreeArr) {
					arr.unshift(x)
				}
				setFilteredInputArr(arr)
				clearFilteredInput();
				setFilteredInput(null)
				break;
			
			case "dai":
				for (let x of dairyFreeArr) {
					arr.unshift(x)
				}
				setFilteredInputArr(arr)
				clearFilteredInput();
				setFilteredInput(null)
				break;
		}
	}

	const renderAddButton = (meal) => {
		if (!meal.clicked) {
			return (
				<button
					key={uuidv4()}
					className="mealpack-add-button button is-medium"
					onClick={() => {
						setSuccessfulSave(false);
						addToMyMealPacks(meal);
						toggleAddButton(meal);
					}}
				>Add</button>
			)
		} else {
			return (
				<button
					disabled
					key={uuidv4()}
					className="mealpack-add-button button is-medium"
				>Added</button>
			)
		}
	}

	const toggleAddButton = (meal) => {
		meal.clicked = !meal.clicked;
	}

	const toggleDropdown = () => {
		let dropdown = document.getElementsByClassName("dropdown")[0];
		dropdown.classList.toggle("is-active")
	}

	const makeFilterLists = () => {
		return (
			<div className="dropdown-content">
				{userFilterLists.map((list) => {
					return (
						<a key={uuidv4()} href="#" className="dropdown-item" onClick={() => fillFilteredFields(list)}>
							{list.filterName}
						</a>
					);
				})}
			</div>
		)
	}

	const fillFilteredFields = (list) => {
		setFilteredInputArr(list.filteredIngredients)
		clearFilteredInput();
		setFilteredInput(null)
	}

	const saveFilterList = async () => {
		setFilterListSaved(true)
		await axios.post(`${API_URL}/store/${user.data.storeId}/filter_list`, 
		{
			filterName: filterListName,
			filteredIngredients: filteredInputArr
		},
		{
			headers: {authorization: `Bearer ${user.accessToken}`}
		})
		let response = await axios.get(`${API_URL}/store/${user.data.storeId}/filter_list`, {
			headers: {authorization: `Bearer ${user.accessToken}`}
		})
		setUserFilterLists(response.data)
	}

	const popover = (e) => (
    <Popover id="popover-basic">
      <Popover.Body id="popover-body">
				<input className="list-name-input" type="text" placeholder="list name" onChange={(e) => setFilterListName(e.target.value)}></input>
				{filterListSaved ? <button className="button is-small save-filter-button" disabled onClick={saveFilterList}>Saved!</button> : <button className="button is-small save-filter-button" onClick={saveFilterList}>Save</button>}
      </Popover.Body>
    </Popover>
  );

	return (
		<div className="homepage">
			<div className="homepage-title-container level">
				<h1 className="homepage-title">Meal Pack Generator</h1>
				<button onClick={()=> setShowGuide(true)}  className="help-button button"><span className="question-mark">?</span>Help</button>
			</div>
			<div className="app-container">
				<div className="app">
					
					<div className="input-section">
						<div className="input-container">
							<button className="accordion open-default"><strong>Ingredients</strong></button>
							<div className="ribs">
								<p className="input-instructions">Add ingredients you want to search with below<br></br></p>
								<div className="level-left">
									<input
										onKeyDown={ingredientKeyHandler}
										id="userIngredientInput"
										className="input" 
										type="text"
										onChange={(e) => setIngredientInput(e.target.value)}
										placeholder="type ingredient here + hit 'enter'"
									></input>
									<button 
										className="button"
										onClick={() => {
											let arr = [...ingredientInputArr]
											arr.unshift(ingredientInput)
											if (ingredientInput) {
												setIngredientInputArr(arr);
												clearIngredientInput();
												setIngredientInput(null);
											}
										}}
									>Add</button>
								</div>
								{ingredientInputArr.length > 0 && ingredientInputArr.map((e) => {
									return (
										<div key={uuidv4()} className="ingredient-name">
											<button key={uuidv4()} className="button ingredient-button is-small" onClick={() => removeIngredient(e)}>X</button>
											<p key={uuidv4()} className="ingredient-title">{e}</p>
										</div>
									)
								})}
								{ingredientInputArr.length > 0 && <p onClick={() => {
									setIngredientInputArr([]);
									clearIngredientInput();
									setIngredientInput(null);
								}} className="clear-button">[x]clear all</p>}
							</div>
						</div>
						<div className="input-container">
							<button className="accordion"><strong>Filter Ingredients</strong> <em>optional</em></button>
							<div className="ribs">
								<p className="input-instructions">
									Add ingredients you DON'T want to include in meal packs<br></br>
								</p>

								<div className="filter-buttons">
									<div className="dropdown" onClick={toggleDropdown}>
										<div className="dropdown-trigger">
											<button className="button is-small" id="dropdown-button" aria-haspopup="true" aria-controls="dropdown-menu">
												<span>My Lists</span>
												<span className="icon is-small">
													<i className="fa fa-angle-down" aria-hidden="true"></i>
												</span>
											</button>
										</div>
										<div className="dropdown-menu" id="dropdown-menu" role="menu">
											{userFilterLists && (makeFilterLists())}
										</div>
									</div>
									<button onClick={() => addFilters("veg")} className="button is-small">Vegetarian</button>
									<button onClick={() => addFilters("glu")} className="button is-small">Gluten-Free</button>
									<button onClick={() => addFilters("dai")} className="button is-small">Dairy-Free</button>
								</div>
								<div className="level-left">
									<input
										onKeyDown={filteredKeyHandler}
										id="userFilteredInput"
										className="input" 
										type="text"
										onChange={(e) => setFilteredInput(e.target.value)}
										placeholder="type ingredient here + hit 'enter'"
									></input>
									<button 
										className="button"
										onClick={() => {
											let arr = [...filteredInputArr]
											arr.unshift(filteredInput)
											if (filteredInput) {
												setFilteredInputArr(arr);
												clearFilteredInput();
												setFilteredInput(null);
											}
										}}
									>Add</button>
								</div>
								{filteredInputArr.length > 0 && filteredInputArr.map((e) => {
									return (
										<div key={uuidv4()} className="ingredient-name">
											<button key={uuidv4()} className="button ingredient-button is-small" onClick={() => removeFiltered(e)}>X</button>
											<p key={uuidv4()} className="ingredient-title">{e}</p>
										</div>
									)
								})}
								{filteredInputArr.length > 0 && (
									<div className="filter-buttons-clear-save">
										<OverlayTrigger trigger="click" rootClose placement="bottom" overlay={popover()}>
											<button className="button">Save List</button>
										</OverlayTrigger>
										<p onClick={() => {
										setFilteredInputArr([])
										clearFilteredInput();
										setFilteredInput(null)
										}} className="clear-button">[x]clear all</p>
									</div>)
								}
							</div>
						</div>
						<button
							onClick={makeArr}
							className="generate-button button is-medium"
							id="generate-button"
						>Generate Meal Packs</button>
					</div>



					<div className="right-side">
						<div className="selected-mealpacks">
							<div className="user-selection-container">
								<h3 className="my-mealpacks-title">Selected Meal Packs</h3>
								<div className="selected-mealpacks-container">
									{successfulSave && (
										<div className="add-success-message-container">
											<h5 className="add-success-message">🎉 Meal packs successfully added! 🎉</h5>
										</div>
									)}
									{myMealPacks &&
										myMealPacks.map((e, index) => {
											return (
												<div key={uuidv4()} className="mealpack-container">
													<div className="mealpack-container-buttons">
														<button
															key={uuidv4()}
															onClick={() => {
																removeFromMyMealPacks(e)
																toggleAddButton(e)
															}}
															className="button is-medium mealpack-add-button"
														>Remove</button>
														<button
															key={uuidv4()}
															className="mealpack-info-button button is-medium"
															onClick={() => {
																setSelectedMealPack(e);
																setShow(true);
															}}
														>See Info</button>
													</div>
													<p key={uuidv4()} className="mealpack-title" id="mealpack-title">
														<strong>{e.title}</strong>
													</p>
													<img className="generated-image" src={e.image}></img>
												</div>
											);
										})
									}
								</div>
							</div>
							<div className="bottom-save-button">
								<div className="buttons-container">
									<button
										style={{ color: "white" }}
										id="save-mealpacks-button"
										disabled={buttonStatus}
										className="publish-button is-medium button has-background-primary-dark"
										onClick={() => {
											publishMealPacks();
											setSuccessfulSave(true);
											setMyMealPacks([]);
										}}
									>Save</button>
									<button 
										id="clear-mealpacks-button"
										className="button is-medium publish-button"
										disabled={buttonStatus}
										onClick={() => {
											setMyMealPacks([])
										}}
									>Clear</button>
								</div>
							</div>
						</div>

						<div className="generated-mealpacks">
							<div className="user-selection-container">
								<h3 className="generated-mealpacks-title">Generated Meal Packs</h3>
								<div className="generated-mealpacks-container">
									{mealPacks &&
										mealPacks.map((e, index) => {
											return (
												<div key={uuidv4()} className="mealpack-container">
													<div className="mealpack-container-buttons">
													{renderAddButton(e)}
													<button
														key={uuidv4()}
														className="mealpack-info-button is-medium button"
														onClick={() => {
															setSelectedMealPack(e);
															setShow(true);
														}}
													>See Info</button>
													</div>
													<p key={uuidv4()} className="mealpack-title" id="mealpack-title">
														<strong>{e.title}</strong>
													</p>
													<img className="generated-image" src={e.image}></img>
												</div>
											);
										})
									}
								</div>
							</div>
						</div>
						
					</div>
					<MealPackModal
						selectedMealPack={selectedMealPack}
						setSelectedMealPack={setSelectedMealPack}
						show={show}
						setShow={setShow}
					/>
					<QuickGuide
					show={showGuide}
					setShowGuide={setShowGuide}
					onHide={() => {setShowGuide(false)
					setIndex(0)}}
					firstLogIn={firstLogIn}
					setFirstLogIn={setFirstLogIn}
					user={user}
					index={index}
					setIndex={setIndex}
					/>
				</div>
			</div>
		</div>
	);
};

export default Homepage;
