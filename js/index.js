let mealsByNameList = [];
let dataRow = document.getElementById('dataRow');
let searchContainer = document.getElementById('searchContainer');
let savedTheme = localStorage.getItem("theme") || "dark";
$("body").attr("data-bs-theme", savedTheme);
$("#theme span").text("theme: " + capitalize(savedTheme));
$(".side-nav").css("left", -$(".side-nav-inner").innerWidth());
$(".closeIcon").fadeOut(0);
$(".side-nav .side-nav-inner ul li").css("top", 150);
let left = $(".side-nav-inner").innerWidth();

// * Loading
$(async () => {
    await getSearchByName('')
    $(".loading-screen").fadeOut(1000);
    $("body").css("overflow", "auto");
});

// * SideNav
function closeSideNav() {
    $(".closeIcon").fadeOut(0);
    $(".openIcon").fadeIn(0);
    $(".side-nav .side-nav-inner ul li").animate({ top: 150 }, 300);
    setTimeout(() => {
        $(".side-nav").css("left", -left);
    }, 300);
}
function openSideNav() {
    $(".side-nav").css("left", 0);
    $(".closeIcon").fadeIn(0);
    $(".openIcon").fadeOut(0);
    $(".side-nav .side-nav-inner ul li").each(function (i) {
        $(this).animate({ top: 0 }, (i + 2) * 80);
    });
}
$(".menuIcon").on("click", () => {
    if ($(".side-nav").css("left") === "0px") {
        closeSideNav();
    } else {
        openSideNav();
    }
});
$(".side-nav .side-nav-inner ul li").on("click", function () {
    closeSideNav();
});

// * Dark/Light Mode
$("#theme").on("click", () => {
    let mode = $("body").attr("data-bs-theme");
    let newMode = mode === "dark" ? "light" : "dark";
    $("body").attr("data-bs-theme", newMode);
    $("#theme span").text("theme: " + capitalize(newMode));
    localStorage.setItem("theme", newMode);
});

//  * scrollTopBtn
const scrollTopBtn = document.getElementById("scrollTopBtn");
window.onscroll = function () {
    if (window.scrollY > 200) {
        scrollTopBtn.classList.remove("d-none");
    } else {
        scrollTopBtn.classList.add("d-none");
    }
};
scrollTopBtn.onclick = function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// * Meals
getMealsByName();
async function getMealsByName() {
    let mealsByNameAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=`);
    let mealsByNameList = await mealsByNameAPI.json();
    console.log(mealsByNameList);
    displayMealsByName(mealsByNameList.meals);
}
function displayMealsByName(mealsByNameList) {
    let result = ``;
    for (let i = 0; i < mealsByNameList.length; i++) {
        result += `<div class="col-12 col-md-6 col-lg-3">
                      <div class="img-card meal-box rounded shadow position-relative" onclick="getMealsById(${mealsByNameList[i].idMeal})">
                          <img src="${mealsByNameList[i].strMealThumb}" alt="${mealsByNameList[i].strMeal}" class="border border-0 rounded-2 img-fluid">
                           <div class="img-overlay position-absolute bg-white bg-opacity-75 border border-0 rounded-2 overflow-hidden">
                               <h2 class="meal-name d-flex align-items-center justify-content-center text-center h-100">${mealsByNameList[i].strMeal}</h2>
                           </div>
                      </div>
                   </div>`
    }
    dataRow.innerHTML = result;
}

// * Meal by Id
async function getMealsById(idMeal) {
    document.getElementById("mealModal").classList.add("d-none");
    $(".inner-loading-screen").fadeIn(500);

    try {
        let mealsByIdAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
        let mealsByIdList = await mealsByIdAPI.json();

        setTimeout(() => {
            displayMealsById(mealsByIdList);
            $(".inner-loading-screen").fadeOut(500, () => {
                document.getElementById("mealModal").classList.remove("d-none");
            });
        }, 500);

        console.log(idMeal, 'id');
    } catch (error) {
        console.error("Error fetching meal:", error);
        $(".inner-loading-screen").fadeOut(500);
    }
}
function displayMealsById(mealsByIdList) {
    searchContainer.innerHTML = ``;
    let tags = mealsByIdList.meals[0].strTags;
    let resultTags = ``;
    if (tags != null) {
        let arrTags = tags.split(',');
        for (let i = 0; i < arrTags.length; i++)
            resultTags += `<li class="border border-0 rounded-2 bg-danger-subtle text-danger-emphasis p-2">${arrTags[i]}</li>`
    }

    let resultRecipes = ``;
    let ingredientsArr = [];
    let measuresArr = [];
    let recipesArr = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = `strIngredient${i}`;
        const measure = `strMeasure${i}`;
        const ingredients = mealsByIdList.meals[0][ingredient];
        const measures = mealsByIdList.meals[0][measure];
        if (ingredients !== "" && ingredients !== null) {
            ingredientsArr.push(ingredients);
            measuresArr.push(measures);
        }
    }

    for (let i = 0; i < measuresArr.length; i++) {
        const measuresArray = measuresArr[i];
        const ingredientsArray = ingredientsArr[i];
        recipesArr.push(`${measuresArray} ${ingredientsArray}`);
        resultRecipes += `<li class="border border-0 rounded-2 bg-info-subtle text-info-emphasis p-2">${recipesArr[i]}</li>`
    }

    let result = `
        <div class="col-md-3">
            <div class="meal-caption">
                <img src="${mealsByIdList.meals[0].strMealThumb}" alt="${mealsByIdList.meals[0].strMeal}" class="border border-0 rounded-2 img-fluid">
                <h1>${mealsByIdList.meals[0].strMeal}</h1>
            </div>
        </div>
        <div class="col-md-9">
            <div class="meal-info">
                <h2>Instructions</h2>
                <p class="mb-2">${mealsByIdList.meals[0].strInstructions}</p>
                <h2 class="mb-2">Area : ${mealsByIdList.meals[0].strArea}</h2>
                <h2 class="mb-2">Category : ${mealsByIdList.meals[0].strCategory}</h2>
                <div class="recipes mb-2">
                    <h2 class="mb-2">Recipes :</h2>
                    <ul class="d-flex flex-wrap gap-2">${resultRecipes}</ul>
                </div>
                <div class="tags mb-4">
                    <h2 class="mb-2">Tags :</h2>
                    <ul class="d-flex flex-wrap gap-2">${resultTags}</ul>
                </div>
                <ul class="d-flex flex-wrap gap-2">
                    <li class="btn btn-success p-2"><a href="${mealsByIdList.meals[0].strSource}" target="_blank">Source</a></li>
                    <li class="btn btn-danger p-2"><a href="${mealsByIdList.meals[0].strYoutube}" target="_blank">Youtube</a></li>
                </ul>
            </div>
        </div>
    `;

    document.getElementById("modalBody").innerHTML = result;
    document.getElementById("mealModal").classList.remove("d-none");
}

// * Close Modal Function
function closeModal() {
    document.getElementById("mealModal").classList.add("d-none");
}

// * Close Modal on background click
document.getElementById("mealModal").addEventListener("click", function (e) {
    if (e.target.id === "mealModal") {
        closeModal();
    }
});

// * Search
function displaySearchInputs() {
    let searchInputResult = `
    <div class="row py-4 g-3">
        <div class="col-md-6">
            <input type="text" onkeyup="getSearchByName(this.value)" class="form-control bg-transparent" placeholder="Search By Name">
        </div>
        <div class="col-md-6">
            <input type="text" onkeyup="getSearchByFirstLetter(this.value)" class="form-control bg-transparent" placeholder="Search By First Letter" maxlength="1">
        </div>
    </div>`
    searchContainer.innerHTML = searchInputResult;
    dataRow.innerHTML = ``;
}
async function getSearchByName(searchQuery) {
    $(".inner-loading-screen").fadeIn(300)
    let searchByNameAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`);
    let searchByNameList = await searchByNameAPI.json();
    displaySearchByName_FirstLetter(searchByNameList);
}
async function getSearchByFirstLetter(searchQuery) {
    $(".inner-loading-screen").fadeIn(300);
    const englishLetterRegex = /^[A-Za-z]$/;

    if (!englishLetterRegex.test(searchQuery)) {
        $(".inner-loading-screen").fadeOut(300);
        dataRow.innerHTML = "";

        // & Toastify Message
        Toastify({
            text: "Please, enter a valid first letter (A-Z)",
            duration: 3000,
            gravity: "bottom",
            position: "right",
            style: {
                background: '#fccd12',
            },
        }).showToast();

        return;
    }

    if (searchQuery === "") {
        $(".inner-loading-screen").fadeOut(300);
        dataRow.innerHTML = "";
        return;
    }

    let searchByFirstLetterAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${searchQuery}`);
    let searchByFirstLetterList = await searchByFirstLetterAPI.json();
    displaySearchByName_FirstLetter(searchByFirstLetterList);
}
function displaySearchByName_FirstLetter(searchQuery) {
    if (searchQuery.meals != null)
        displayMealsByName(searchQuery.meals);
    $(".inner-loading-screen").fadeOut(300)
}

// * Categories
async function getMealsByCategories() {
    $(".inner-loading-screen").fadeIn(300)
    let mealsByCategoryAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`);
    let mealsByCategoryList = await mealsByCategoryAPI.json();
    displayMealsByCategory(mealsByCategoryList.categories);
    $(".inner-loading-screen").fadeOut(300)
}
function displayMealsByCategory(mealsByCategoryList) {
    searchContainer.innerHTML = ``;
    let result = ``;
    for (let i = 0; i < mealsByCategoryList.length; i++) {
        result += `
        <div class="col-md-3">
            <div class="img-card position-relative" onclick="filterMealsByCategory('${mealsByCategoryList[i].strCategory}')">
                <img src="${mealsByCategoryList[i].strCategoryThumb}" alt="${mealsByCategoryList[i].strCategory}" class="border border-0 rounded-2">
                    <div class="img-overlay position-absolute text-center bg-white bg-opacity-75 border border-0 rounded-2 overflow-hidden">
                        <h2>${mealsByCategoryList[i].strCategory}</h2>
                        <p>${mealsByCategoryList[i].strCategoryDescription}</p>
                    </div>
            </div>
        </div>
        `
    }
    dataRow.innerHTML = result;
}
async function filterMealsByCategory(categoryName) {
    $(".inner-loading-screen").fadeIn(300)
    let filterByCategoryAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName.trim()}`);
    let filterByCategoryList = await filterByCategoryAPI.json();
    filterByCategoryList = filterByCategoryList.meals.slice(0, 20);
    displayMealsByName(filterByCategoryList);
    $(".inner-loading-screen").fadeOut(300)
}

// * Area
async function getMealsByArea() {
    $(".inner-loading-screen").fadeIn(300)
    let mealsByAreaAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/list.php?a=list`);
    let mealsByAreaList = await mealsByAreaAPI.json();
    displayMealsByArea(mealsByAreaList.meals);
    $(".inner-loading-screen").fadeOut(300)
}
function displayMealsByArea(mealsByAreaList) {
    searchContainer.innerHTML = ``;

    let result = ``;
    for (let i = 0; i < mealsByAreaList.length; i++) {
        result += `
        <div class="col-md-3">
            <div class="area text-center cursor-pointer rounded shadow" onmouseover="animatePulse(this)"
                onclick="filterMealsByArea('${mealsByAreaList[i].strArea}')">
                <i class="fa-solid fa-house-laptop fa-4x"></i>
                <h2>${mealsByAreaList[i].strArea}</h2>   
            </div>
        </div>
        `
    }
    dataRow.innerHTML = result;
}
async function filterMealsByArea(areaName) {
    $(".inner-loading-screen").fadeIn(300)
    let filterByAreaAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${areaName}`);
    let filterByAreaList = await filterByAreaAPI.json();
    filterByAreaList = filterByAreaList.meals.slice(0, 20);
    displayMealsByName(filterByAreaList);
    $(".inner-loading-screen").fadeOut(300)
}

// * Ingredients
async function getMealsByIngredients() {
    $(".inner-loading-screen").fadeIn(300)
    let mealsByIngredientsAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/list.php?i=list`);
    let mealsByIngredientsList = await mealsByIngredientsAPI.json();
    mealsByIngredientsList = mealsByIngredientsList.meals.slice(0, 20);
    displayMealsByIngredients(mealsByIngredientsList);
    $(".inner-loading-screen").fadeOut(300)
}
function displayMealsByIngredients(mealsByIngredientsList) {
    searchContainer.innerHTML = ``;
    let result = ``;
    for (let i = 0; i < mealsByIngredientsList.length; i++) {
        result += `
        <div class="col-md-3">
            <div class="ingredient text-center rounded shadow cursor-pointer" onmouseover="animatePulse(this)"
                onclick="filterMealsByIngredients('${mealsByIngredientsList[i].strIngredient}')">
                <i class="fa-solid fa-drumstick-bite fa-4x"></i>
                <h2>${mealsByIngredientsList[i].strIngredient}</h2>  
                <p>${mealsByIngredientsList[i].strDescription.slice(0, 100)}<p> 
            </div>
        </div>
        `
    }
    dataRow.innerHTML = result;
}
async function filterMealsByIngredients(ingredientName) {
    $(".inner-loading-screen").fadeIn(300)
    let filterByIngredientsAPI = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientName}`);
    let filterByIngredientsList = await filterByIngredientsAPI.json();
    filterByIngredientsList = filterByIngredientsList.meals.slice(0, 20);
    displayMealsByName(filterByIngredientsList);
    $(".inner-loading-screen").fadeOut(300)
}

// * Contact
function contactForm() {
    searchContainer.innerHTML = ``;
    dataRow.innerHTML = `
    <div class="min-vh-100 w-75 mx-auto d-flex align-items-center justify-content-center">
        <form action="#">
            <div class="row g-4">
                <div class="col-md-6">
                    <input type="text" class="nameInput form-control" placeholder="Enter Your Name">
                    <p class="nameAlert alert alert-danger w-100 mt-2 d-none text-center">
                        Special characters and numbers not allowed
                    </p>
                </div>
                <div class="col-md-6">
                    <input type="email" class="emailInput form-control" placeholder="Enter Your Email">
                    <p class="emailAlert alert alert-danger w-100 mt-2 d-none text-center">
                        Email not valid *exemple@yyy.zzz
                    </p>
                </div>
                <div class="col-md-6">
                    <input type="tel" class="phoneInput form-control" placeholder="Enter Your Phone">
                    <p class="phoneAlert alert alert-danger w-100 mt-2 d-none text-center">
                        Enter valid Phone Number
                    </p>
                </div>
                <div class="col-md-6">
                    <input type="number" class="ageInput form-control" placeholder="Enter Your Age">
                    <p class="ageAlert alert alert-danger w-100 mt-2 d-none text-center">
                        Enter valid age
                    </p>
                </div>
                <div class="col-md-6">
                    <input type="password" class="passwordInput form-control" placeholder="Enter Your Password">
                    <p class="passwordAlert alert alert-danger w-100 mt-2 d-none text-center">
                        Enter valid password *Minimum eight characters, at least one letter and one number:*
                    </p>
                </div>
                <div class="col-md-6">
                    <input type="password" class="repasswordInput form-control" placeholder="RePassword">
                    <p class="repasswordAlert alert alert-danger w-100 mt-2 d-none text-center">
                        Enter valid repassword
                    </p>
                </div>
                <div class="col text-center">
                    <button class="submitBtn btn btn-outline-danger" disabled>Submit</button>
                </div>
            </div>
        </form>
    </div>
    `;

    const inputs = {
        name: document.querySelector(".nameInput"),
        email: document.querySelector(".emailInput"),
        phone: document.querySelector(".phoneInput"),
        age: document.querySelector(".ageInput"),
        password: document.querySelector(".passwordInput"),
        repassword: document.querySelector(".repasswordInput"),
    };

    const alerts = {
        name: document.querySelector(".nameAlert"),
        email: document.querySelector(".emailAlert"),
        phone: document.querySelector(".phoneAlert"),
        age: document.querySelector(".ageAlert"),
        password: document.querySelector(".passwordAlert"),
        repassword: document.querySelector(".repasswordAlert"),
    };

    const submitBtn = document.querySelector(".submitBtn");

    const regex = {
        name: /^[A-Za-z ]+$/,
        email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        phone: /^(\d{10}|\d{11})$/,
        age: /^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/,
        password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    };

    function validate(field) {
        let value = inputs[field].value.trim();
        let isValid = false;

        if (field === "repassword") {
            isValid = value === inputs.password.value && regex.password.test(value);
        } else {
            isValid = regex[field].test(value);
        }

        alerts[field].classList.toggle("d-none", isValid);
        alerts[field].classList.toggle("d-block", !isValid);
        checkAllValidation();
    }

    Object.keys(inputs).forEach((field) => {
        inputs[field].addEventListener("input", () => validate(field));
        inputs[field].addEventListener("blur", () => validate(field));
    });

    function checkAllValidation() {
        const allValid =
            regex.name.test(inputs.name.value.trim()) &&
            regex.email.test(inputs.email.value.trim()) &&
            regex.phone.test(inputs.phone.value.trim()) &&
            regex.age.test(inputs.age.value.trim()) &&
            regex.password.test(inputs.password.value.trim()) &&
            inputs.repassword.value === inputs.password.value &&
            regex.password.test(inputs.repassword.value.trim());

        submitBtn.disabled = !allValid;
    }
}

// * For Animation In Cards (Area & Ingredients)
function animatePulse(element) {
    element.classList.remove('animate__animated', 'animate__pulse');
    void element.offsetWidth;
    element.classList.add('animate__animated', 'animate__pulse');
}