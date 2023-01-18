import axios from "axios";
import ActiveView from "./components/ActiveView";
import PastView from "./components/PastView";
import MealPack from "./MealPack";
import MealPackModal from "./components/MealPackModal"
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages/_homepage.scss";

// DUMMY DATA FOR TESTING #############################
const dummyData = [
	{
		id: 1,
		title: "Spaghetti",
		servings: 4,
		vegetarian: true,
		dairyFree: true,
		glutenFree: false,
		ingredients: ["pasta", "sauce", "garlic"],
		instructions: [
			{
				number: 1,
				step: "These are first step instructions"
			},
			{
				number: 2,
				step: "These are second step instructions"
			},
			{
				number: 3,
				step: "These are third step instructions"
			}
		]
	},
	{
		id: 2,
		title: "Chicken and Broccoli",
		servings: 6,
		vegetarian: false,
		dairyFree: true,
		glutenFree: true,
		ingredients: ["chicken", "broccoli"],
		instructions: [
			{
				number: 1,
				step: "These are first step instructions"
			},
			{
				number: 2,
				step: "These are second step instructions"
			},
			{
				number: 3,
				step: "These are third step instructions"
			}
		]
	},
	{
		id: 3,
		title: "Ham Sandwich",
		servings: 2,
		vegetarian: false,
		glutenFree: false,
		dairyFree: false,
		ingredients: ["bread", "ham", "cheese"],
		instructions: [
			{
				number: 1,
				step: "These are first step instructions"
			},
			{
				number: 2,
				step: "These are second step instructions"
			},
			{
				number: 3,
				step: "These are third step instructions"
			}
		]
	},
]
//######################################################

const Homepage = (props) => {
	const {
		selectedActivePack,
		setSelectedActivePack,
		activeMealPacks,
		setActiveMealPacks,
		pastMealPacks,
		setPastMealPacks,
	} = props;

	const [text, setText] = useState(null)
	const [ingredientArr, setIngredientArr] = useState([])
	const [mealPacks, setMealPacks] = useState(null)
	const [vegetarian, setVegetarian] = useState(false)
	const [glutenFree, setGlutenFree] = useState(false)
	const [dairyFree, setDairyFree] = useState(false)
	const isMounted = useRef(false)
	const [show, setShow] = useState(false);
	const [selectedMealPack, setSelectedMealPack] = useState(null);
	const [myMealPacks, setMyMealPacks] = useState([])

	const makeIngredientArr = () => {
		text && setIngredientArr(text.split(/\r?\n/))
	}

	// prints ingredient array to console
	useEffect(() => {
		async function fetchData() {
			if (isMounted.current) {
				const data = await axios.post('/sample/recipe', {
					ingredients: ingredientArr
				})
				setMealPacks(data.data)
				const idArray = [];
				data.data.forEach((e) => idArray.push(e.id))
			} else {
				isMounted.current = true;
			}
		}
		fetchData()
	}, [ingredientArr])

	const displayPacks = () => {
		const filterObj = {
			vegetarian: vegetarian,
			glutenFree: glutenFree,
			dairyFree: dairyFree
		}
		const filterArr = [];
		for (let x in filterObj) {
			if (filterObj[x]) {
				filterArr.push(x)
			}
		}
		if (filterArr.length > 0) {
			console.log("filters!")
		} else {
			setMealPacks(dummyData)
		}
	}

	const addToMyMealPacks = (meal) => {
		let array = [...myMealPacks]
		array.push(meal)
		setMyMealPacks(array)
	};

	const removeFromMyMealPacks = (meal) => {
		let array = [...myMealPacks]
		array.splice(array.indexOf(meal), 1)
		setMyMealPacks(array)
	}

	const user = JSON.parse(localStorage.getItem("user"))
	const storeId = user.userData[0].userId

	const publishMealPacks = () => {
		const user = JSON.parse(localStorage.getItem("user"))
		const storeId = user.userData[0].userId
		// axios.post(`/store/${storeId}/mealpack`, {
		// 	data: myMealPacks
		// })
	}

	const navigate = useNavigate();
	const logout = () => {
		navigate("/");
	}

	return (
		<div className="app-container">
			<div className="app">
				<button onClick={logout} className="logout-button">Logout</button>
				<h1>This is the homepage</h1>
				<div className="input-container">
					<p className="input-instructions">Type or copy/paste ingredients below<br></br><em>(each ingredient must be on a new line)</em></p>
					<textarea onChange={(e) => setText(e.target.value)} className="input-box" cols="50" rows="10" placeholder="eggplant&#10;white rice&#10;daikon&#10;chicken thigh"></textarea>
					<form>
						<input onChange={() => {
							if (vegetarian) {
								setVegetarian(false)
							} else {
								setVegetarian(true)
							}
						}} type="checkbox" name="vegetarian"></input>
						<label style={{ marginRight: "10px" }} htmlFor="vegetarian">Vegetarian</label>
						<input onChange={() => {
							if (glutenFree) {
								setGlutenFree(false)
							} else {
								setGlutenFree(true)
							}
						}} type="checkbox" name="gluten-free"></input>
						<label style={{ marginRight: "10px" }} htmlFor="gluten-free">Gluten-Free</label>
						<input onChange={() => {
							if (dairyFree) {
								setDairyFree(false)
							} else {
								setDairyFree(true)
							}
						}} type="checkbox" name="dairy-free"></input>
						<label style={{ marginRight: "10px" }} htmlFor="dairy-free">Dairy-Free</label>
					</form>
					<button onClick={makeIngredientArr} className="generate-button">Generate Meal Packs</button>
					<button onClick={displayPacks}>Dummy Data Test</button>
				</div>
				{mealPacks && (
					<div className="user-selection-container">
						<div className="generated-mealpacks-container">
							<h3>Generated Meal Packs:</h3>
							{mealPacks && mealPacks.map(e => {
								return (
									<div key={e.id} className="mealpack-container">
										<button onClick={() => addToMyMealPacks(e)} className="mealpack-add-button button">Add To "My Meal Packs"</button>
										<button className="mealpack-info-button button" onClick={() => {
											setSelectedMealPack(e)
											setShow(true)
										}}>See Meal Pack Info</button>
										<p className="mealpack-title"><strong>{e.title}</strong> meal pack</p>
									</div>
								)
							})}
						</div>
						<div className="selected-mealpacks">
							<div className="selected-mealpacks-container">
								<h3>My Meal Packs:</h3>
								{myMealPacks && myMealPacks.map((e, index) => {
									return (
										<div className="mealpack-container">
											<button onClick={() => removeFromMyMealPacks(e)} className="button">Remove from "My Meal Packs"</button>
											<button className="mealpack-info-button button" onClick={() => {
												setSelectedMealPack(e)
												setShow(true)
											}}>See Meal Pack Info</button>
											<p className="mealpack-title" key={index}><strong>{e.title}</strong> meal pack</p>
										</div>
									)
								})}
							</div>
						</div>
						<button className="publish-button" onClick={() => {
								// setMealPacks(null)
								publishMealPacks();
								setMyMealPacks([])
							}}>Publish My Meal Packs</button>
					</div>
				)}
				<ActiveView
					selectedActivePack={selectedActivePack}
					setSelectedActivePack={setSelectedActivePack}
					activeMealPacks={activeMealPacks}
					setActiveMealPacks={setActiveMealPacks}
					setPastMealPacks={setPastMealPacks}
				/>
				<PastView 
					setActiveMealPacks={setActiveMealPacks}
				/>
				<MealPackModal selectedMealPack={selectedMealPack} setSelectedMealPack={setSelectedMealPack} show={show} setShow={setShow}/>
				<div className="one" style={{ display: "flex", height: "100px", width: "100px"}}></div>
				<div className="two" style={{ display: "flex", height: "100px", width: "100px"}}></div>
				<div className="three" style={{ display: "flex", height: "100px", width: "100px"}}></div>
				<div className="four" style={{ display: "flex", height: "100px", width: "100px"}}></div>
				<div className="five" style={{ display: "flex", height: "100px", width: "100px"}}></div>
			</div>
		</div>
	);
};

export default Homepage;
