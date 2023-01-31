import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../../styles/pages/_homepage.scss";
import { v4 as uuidv4 } from "uuid";
import API_URL, {REACT_APP_URL} from "../../../Constants";
import MealPackDetailsModal from "./MealPackDetailsModal"
import {Popover, OverlayTrigger, Button} from 'react-bootstrap';

const ActiveView = (props) => {
	const [show, setShow] = useState(false);
	const [selectedMealPack, setSelectedMealPack] = useState(null);

	const {
		activeMealPacks,
		setActiveMealPacks,
		setPastMealPacks,
		pastMealPacks,
		selectedActivePack,
		setSelectedActivePastPack,
	} = props;

	useEffect(() => {
		async function fetchData() {
			const user = JSON.parse(localStorage.getItem("user"));
			const storeId = user.data.storeId;
			let data = await axios.get(
				`${API_URL}/store/${storeId}/mealpack/all/status/true`,
				{
					headers: { authorization: `Bearer ${user.accessToken}` },
				}
			);
			setActiveMealPacks(data.data);
		}
		fetchData();
	}, []); // pastMealPacks (causing infinite calls)

	// fetchActivePacks copies above useEffect, without causing infinite loop
	const fetchActivePacks = async () => {
		const user = JSON.parse(localStorage.getItem("user"));
		const storeId = user.data.storeId;
		let data = await axios.get(
			`${API_URL}/store/${storeId}/mealpack/all/status/true`,
			{
				headers: { authorization: `Bearer ${user.accessToken}` },
			}
		);
		setActiveMealPacks(data.data);
	};

	const navigate = useNavigate();
	const rerouteToMealpack = (meal) => {
		setSelectedActivePastPack(meal);
		navigate("/mealpack");
	};

	const downloadPDF = (meal) => {
		let qrCode = generateQRCode(meal);
		const doc = new jsPDF("p", "mm", "a4");
		let width = doc.internal.pageSize.getWidth();
		const name = meal.mealpackName;
		const instructions = meal.recipeDetail.analyzedInstructions[0].steps.map((e) => " " + e.number + "." + " " + e.step)
		const ingredients = meal.recipeDetail.extendedIngredients.map((e) => " " + e.name)
		doc.setFontSize(24);
		doc.text(10, 90, `${name}`);
		doc.setFontSize(18);
		doc.text(10, 110, [`Ingredients: ${ingredients}`], {
			maxWidth: width / 1.15,
		})
		doc.text(10, 140, [`${instructions}`], {
			maxWidth: width / 1.15,
		});
		doc.addImage(qrCode, "PNG", 10, 15, 50, 50);
		doc.addImage(meal.recipeDetail.image, "JPG", 100, 15, 80, 50)
		doc.autoPrint({ variant: "non-conform" });
		doc.save("print-mealpacks.pdf");
	};

	const downloadAllPDF = () => {
		console.log("not yet dummy");
	};

	const generateQRCode = (meal) => {
		const QRCode = require("qrcode");
		let qrCodeDataUrl;
		let recipeId = meal.recipeId
		QRCode.toDataURL(`${REACT_APP_URL}/info/${recipeId}`, function (err, url) {
			qrCodeDataUrl = url;
		});
		return qrCodeDataUrl;
	};

	const deactivateMealPack = async (meal) => {
		const user = JSON.parse(localStorage.getItem("user"));
		const storeId = user.data.storeId;
		await axios.put(
			`${API_URL}/store/${storeId}/mealpack/${meal.id}`,
			{
				isPublishing: false,
				mealpackName: meal.mealpackName,
				isDelete: false,
			},
			{
				headers: { authorization: `Bearer ${user.accessToken}` },
			}
		);
		let data = await axios.get(
			`${API_URL}/store/${storeId}/mealpack/all/status/false`,
			{
				headers: { authorization: `Bearer ${user.accessToken}` },
			}
		);
		setPastMealPacks(data.data);
	};

	//Handles deleting mealpack
	const deleteMealPack = async (meal) => {
		const user = JSON.parse(localStorage.getItem("user"));
		const storeId = user.data.storeId;
		//route
		await axios.delete(
			`${API_URL}/store/${storeId}/mealpack/${meal.id}`,
			{
				headers: { authorization: `Bearer ${user.accessToken}` },
			}
		);
		let data = await axios.get(
			`${API_URL}/store/${storeId}/mealpack/all/status/false`,
			{
				headers: { authorization: `Bearer ${user.accessToken}` },
			}
		);
		setPastMealPacks(data.data);
	}

	//Popoever
const popover = (e) => (
  <Popover id="popover-basic">
    <Popover.Header as="h3">Delete mealpack?</Popover.Header>
    <Popover.Body>
        Are you sure you want to <strong>delete</strong> this mealpack?
      </Popover.Body>
      <Button
        variant="primary"
        onClick={async () => {
          //As of the moment to check if it is working
          await deactivateMealPack(e)
          fetchActivePacks()
        }}
      >
        Yes
      </Button>{" "}
      <Button
        variant="primary"
        onClick={() => {
          document.body.click()
        }}
      >
        No
      </Button>{" "}
  </Popover>
);

  return (
    <div className="active-container">
      <h2 className="active-title">Favorite Meal Packs</h2>

      <div className="tile is-parent active-mealpacks">
        {activeMealPacks && activeMealPacks.map((e, index) => {
          return (
            <div key={uuidv4()} className="tile is-child is-4">
              <div key={uuidv4()} className="active-mealpack-container">
                <img className="food-small-image" src={e.recipeDetail["image"]}></img>
                <p key={uuidv4()} className="mealpack-title"><strong>{e.mealpackName}</strong></p>
                <div className="tags active-mealpacks-tags">
                  {e.recipeDetail.vegetarian && <span className="tag" id="vegetarian">vegetarian</span>}
                  {e.recipeDetail.vegan && <span className="tag" id="vegan">vegan</span>}
                  {e.recipeDetail.glutenFree && <span className="tag" id="gluten">gluten free</span>}
                  {e.recipeDetail.dairyFree && <span className="tag" id="dairy">dairy free</span>}
                </div>
                <div className="active-mealpacks-buttons">
                  <button key={uuidv4()} className="button" onClick={() => downloadPDF(e)} style={{ marginBottom: "10px" }}>Download PDF</button>
                  <button key={uuidv4()} className="button" onClick={() => {
										//Old code
										// rerouteToMealpack(e)
										setShow(true)
										setSelectedMealPack(e)
										}}>See Meal Pack Info</button>
                  <button key={uuidv4()} className="button" onClick={async () => {
                    await deactivateMealPack(e)
                    fetchActivePacks()
                  }}>Remove from Favorites</button>
									<OverlayTrigger trigger="click" rootClose placement="right" overlay={popover(e)}>
  									<button className="button">Delete</button>
									</OverlayTrigger>
                </div>
              </div>
            </div>
          );
        })}
      </div>
			<footer className="footer"></footer>
			<MealPackDetailsModal
				selectedMealPack={selectedMealPack}
					setSelectedMealPack={setSelectedMealPack}
					show={show}
					setShow={setShow}
			/>
    </div>
  )
}

export default ActiveView;
