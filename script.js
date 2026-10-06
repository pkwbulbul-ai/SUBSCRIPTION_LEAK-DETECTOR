const form = document.querySelector("form");

const list = document.createElement("div");
list.style.marginTop = "30px";
form.parentElement.appendChild(list);

let subscriptions =
    JSON.parse(localStorage.getItem("subscriptions")) || [];


form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const price = Number(document.getElementById("price").value);
    const planType = document.getElementById("planType").value;
    const cycle = document.getElementById("billingCycle").value;
    const date = document.getElementById("renewalDate").value;

    if (!name || !date) {
        alert("Please fill all details!");
        return;
    }

    subscriptions.push({
        name: name,
        price: price,
        planType: planType,
        cycle: cycle,
        date: date
    });

    localStorage.setItem(
        "subscriptions",
        JSON.stringify(subscriptions)
    );

    form.reset();

    showSubscriptions();
});


function getMonthlyPrice(sub) {

    if (sub.cycle === "yearly") {
        return Number(sub.price) / 12;
    }

    return Number(sub.price);
}


function getDaysLeft(date) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(date + "T00:00:00");

    return Math.ceil(
        (target - today) / (1000 * 60 * 60 * 24)
    );
}


function showSubscriptions() {

    list.innerHTML = "<h2>My Subscriptions</h2>";

    let monthlyTotal = 0;
    let potentialSavings = 0;

    subscriptions.forEach(function(sub, index) {

        const monthlyPrice = getMonthlyPrice(sub);

        monthlyTotal += monthlyPrice;


        /* OVERLAPPING SUBSCRIPTION */

        const sameSubscriptions = subscriptions.filter(function(item) {

            return (
                item.name.toLowerCase() ===
                sub.name.toLowerCase()
            );

        });


        let overlapWarning = "";

        if (sameSubscriptions.length > 1) {

            overlapWarning = `
                <p style="color:#dc2626; font-weight:bold;">
                    ⚠️ Possible overlapping subscription
                </p>
            `;

            /*
              Every duplicate after the first one
              is considered a possible saving.
            */

            if (
                subscriptions.findIndex(function(item) {
                    return (
                        item.name.toLowerCase() ===
                        sub.name.toLowerCase()
                    );
                }) !== index
            ) {
                potentialSavings += monthlyPrice;
            }
        }


        /* RENEWAL */

        const daysLeft = getDaysLeft(sub.date);

        let renewalMessage = "";

        if (daysLeft < 0) {

            renewalMessage = "⚠️ Renewal date passed";

        } else if (daysLeft === 0) {

            renewalMessage = "⚠️ Renews Today!";

        } else if (daysLeft <= 7) {

            renewalMessage =
                "🔔 Renewal in " + daysLeft + " days";

        } else {

            renewalMessage =
                "📅 Renewal in " + daysLeft + " days";
        }


        /* FREE TRIAL WARNING */

        let trialWarning = "";

        if (sub.planType === "trial") {

            if (daysLeft < 0) {

                trialWarning = `
                    <p style="color:#dc2626; font-weight:bold;">
                        ⚠️ Free trial has ended
                    </p>
                `;

            } else if (daysLeft <= 7) {

                trialWarning = `
                    <p style="color:#dc2626; font-weight:bold;">
                        ⚠️ Free trial ending soon!
                    </p>
                `;

            } else {

                trialWarning = `
                    <p style="color:#16a34a; font-weight:bold;">
                        🆓 Free trial active
                    </p>
                `;
            }
        }


        /* PLAN TYPE */

        let typeText = "";

        if (sub.planType === "trial") {

            typeText = "🆓 Free Trial";

        } else {

            typeText = "💳 Regular Subscription";
        }


        /* CARD */

        const card = document.createElement("div");

        card.style.background = "white";
        card.style.padding = "18px";
        card.style.marginTop = "15px";
        card.style.borderRadius = "12px";
        card.style.boxShadow =
            "0 3px 10px rgba(0,0,0,0.08)";


        card.innerHTML = `
            <h3>${sub.name}</h3>

            <p>${typeText}</p>

            <p>💰 Price: ₹${sub.price}</p>

            <p>🔄 Billing: ${sub.cycle}</p>

            <p>📅 Date: ${sub.date}</p>

            <p><b>${renewalMessage}</b></p>

            ${trialWarning}

            ${overlapWarning}

            <button onclick="deleteSubscription(${index})">
                🗑️ Delete
            </button>
        `;


        list.appendChild(card);
    });


    /* TOTAL COST */

    const total = document.createElement("div");

    total.style.marginTop = "20px";
    total.style.padding = "18px";
    total.style.background = "#4f46e5";
    total.style.color = "white";
    total.style.borderRadius = "12px";


    total.innerHTML = `
        <h3>Estimated Monthly Cost</h3>

        <h2>
            ₹${monthlyTotal.toFixed(2)}
        </h2>


        <h3>Estimated Yearly Cost</h3>

        <h2>
            ₹${(monthlyTotal * 12).toFixed(2)}
        </h2>


        <h3>Potential Savings</h3>

        <h2>
            ₹${potentialSavings.toFixed(2)} / month
        </h2>


        <p>
            💡 Yearly potential saving:
            ₹${(potentialSavings * 12).toFixed(2)}
        </p>
    `;


    list.appendChild(total);
}


/* DELETE */

function deleteSubscription(index) {

    subscriptions.splice(index, 1);

    localStorage.setItem(
        "subscriptions",
        JSON.stringify(subscriptions)
    );

    showSubscriptions();
}


/* LOAD SAVED DATA */

showSubscriptions();