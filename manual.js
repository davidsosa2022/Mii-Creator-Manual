var isChanging = false;

function changePage(e) {
    var pageNum = e.currentTarget.getAttribute("data-page");
    swapPage(pageNum, false);
}

function changePageEx(pageNum) {
    swapPage(pageNum);
}

function replacePageEx(pageNum) {
    swapPage(pageNum, true);
}

function swapPage(pageNum, replace) {
    if (isChanging) {
        return;
    }
    isChanging = true;
    console.log("swappin")
    var tc = document.querySelector(".page.display, .page.fadein");
    var ts = document.querySelector(".page#page-" + pageNum);

    if (tc) {
        var ph =  tc.getAttribute("id").replace("page-", "");
        console.log("page to hide: " + tc.getAttribute("id").replace("page-", ""))
        console.log("page to show: " + pageNum)

        if (ph === pageNum) {
            console.log("WHY THE FUCK DOES THIS HAPPEN?")
            return;
        }
    }

    for (let sheet of document.styleSheets) {
        for (let rule of sheet.cssRules) {
            if (rule.selectorText === ".fadein" && tc) {
                rule.style.minHeight = tc.getBoundingClientRect().height + "px"; // Change the property
            }
        }
    }

    ts.classList.add("fadein");

    ts.addEventListener("animationend", function handler() {
        ts.classList.add("display");
        ts.classList.remove("fadein");

        if (tc) {
        tc.classList.remove("fadein")
        tc.classList.remove("display")
        }
        ts.removeEventListener("animationend", handler);
        isChanging = false;
    });


    if (replace) {
        console.log("replace state page: " + pageNum)
        history.replaceState({}, "", "?page=" + pageNum);
    } else {
        console.log("pushed state page: " + pageNum)
        history.pushState({}, "", "?page=" + pageNum);
        window.scrollTo(0,0)
    }

}

const sKey = "recipe_lng";

//Get language for Recipe
function getRecipeLang() {
    //thats like better beauty, laugh and peace
    var la = localStorage.getItem(sKey);
    if (la == null) {
        localStorage.setItem(sKey, getBrowserLang());
        //Get item again
        la = localStorage.getItem(sKey);
    }
    return la;
}

function getBrowserLang() {
    //FAR FROM PERFECT, this just attempts to get your language based on stupid arrays.
    //You can always change your  language with the funy button on the bottom right corner .
    //this Checks and tries to get the closest locale, this might not be perfect, feel free to fix or add new languages!
    var lang;
    var navLang = navigator.language;

    // List of known American English variants
    var enUS = [
        "en-US", "en-CA", "en-BZ", "en-JM", "en-TT", "en-GY", "en-PR", "en-PH", "en-AS", "en-UM", "en-VI", "en-GU", "en-MP", "en-US-POSIX"
    ];

    //List of known Mexican Spanish variants (Latin America)
    var enMX = [
        "es-419", "es-AR", "es-BO", "es-BR", "es-BZ", "es-CL", "es-CO", "es-CR", "es-CU", "es-DO",
        "es-EC", "es-GQ", "es-GT", "es-HN", "es-MX", "es-NI", "es-PA", "es-PE", "es-PH", "es-PR",
        "es-PY", "es-SV", "es-US", "es-UY", "es-VE"
    ];

    // List of known North American (and Caribbean) French variants
    var frCA = [
        "fr-CA", "fr-GF", "fr-GP", "fr-MQ", "fr-HT"
    ];

    var caES = [
        "ca-AD", "ca-ES"
    ];

    var deDE = [
        "de-DE", "de-BE", "de-LU"
    ];

    var ptBR = [
        "pt-BR", "pt-GQ", "pt-MO"
    ];

    // If it's English, determine whether it's US English or UK/European English
    if (navLang.startsWith("en-")) {
        lang = enUS.includes(navLang) ? "en_US" : "en_GB";
    } else if (navLang.startsWith("ca")) {
        //If its not Andorra or Spains Catalan, reset to Spanish
        lang = caES.includes(navLang) ? "ca_ES" : "es_ES";
    } else if (navLang.startsWith("es-")) {
        //Spanish checks, since Spain and Latin American Spanish has some differences
        lang = enMX.includes(navLang) ? "es_MX" : "es_ES";
    } else if (navLang.startsWith("fr")) {
        // For French: if it's in the North American list, use fr_CA, else if in European list, use fr_FR.
        lang = frCA.includes(navLang) ? "fr_CA" : "fr_FR";
    } else if (navLang.startsWith("it")) {
        //All italian variations seem to be similar anyway
        lang = "it_IT"
    } else if (navLang.startsWith("de")) {
        //German, if not the current German then English
        lang = deDE.includes(navLang) ? "de_DE" : "en_GB";
    } else if (navLang.startsWith("pt")) {
        //Portuguese seems to be different between Brazil and Portugal
        lang = ptBR.includes(navLang) ? "pt_BR" : "pt_PT";
    } else if (navLang.startsWith("ja")) {
        //Konichiwhaaaaat?
        lang = "ja_JP";
    } else {
        //CaseOh lives here.
        lang = "en_US";
    }


    return lang;
}

function initRecipe(callback) {

    var a = new XMLHttpRequest();
    var lang = getRecipeLang();

    a.open("GET", location.origin + "/loc/" + lang + "/manual.xml");
    a.send();
    a.onload = function () {
        if (a.status === 200) {
            var parser = new DOMParser();
            var x = parser.parseFromString(a.responseText, "text/xml");

            var contents = document.querySelector(".contents-links"); // Adjust to the correct selector
            var table = x.getElementsByTagName("tablecontents")[0];
            var linksNum = 1;

            if (table) {
                var els = Array.from(table.getElementsByTagName("section"));

                els.forEach(function (el) {
                    var title = el.getElementsByTagName("sectionname")[0]; // Get first element

                    // Ensure title exists before proceeding
                    if (title) {
                        var t = document.createElement("h1");
                        t.innerHTML = title.textContent; // Extract the text
                        contents.appendChild(t); // Append correctly
                    }

                    var lnks = Array.from(el.getElementsByTagName("article"));

                    lnks.forEach(function (l) {
                        var s = document.createElement("a");
                        var i = document.createElement("span");
                        var t = document.createElement("span");

                        i.classList.add("num");
                        i.innerText = linksNum;

                        t.innerHTML = l.textContent; // Extract the text

                        s.setAttribute("href", "javascript:void(0)")
                        s.setAttribute("data-page", linksNum)
                        s.appendChild(i)
                        s.appendChild(t)
                        contents.appendChild(s); // Append correctly

                        linksNum++;
                    })


                });

                //Set text strings to already existing HTML elements
                var title = table.getElementsByTagName("recipetitle")[0];
                document.querySelector("header.default .site-name>span").innerText = title.textContent;

                var cotext = table.getElementsByTagName("contentstext")[0];
                document.querySelector("header.default .content-text>span").innerText = cotext.textContent;

                var lngbtnt = table.getElementsByTagName("languagebtext")[0];
                var lngctext = table.getElementsByTagName("languagectext")[0];
                var lngitext = table.getElementsByTagName("languageitext")[0];
                document.querySelector("header.default .languagebutton").innerText = lngbtnt.textContent;
                document.querySelector("#page-0 .site-name>span").innerText = lngbtnt.textContent;
                document.querySelector("#page-0 .content-text>span").innerText = lngctext.textContent;
                document.querySelector("#page-0 .curlang>span").innerText = lngitext.textContent;

                var co = document.createElement("span");
                co.classList.add("cinfo")
                co.innerText = x.getElementsByTagName("copyright")[0].textContent;

                var sellang = document.querySelector('.langselect .langbut>a[data-lang="' + lang +  '"]');
                var sellangname = document.querySelector(".langselect .curlang>h1");

                sellang.classList.add("checked");
                sellangname.innerHTML = sellang.innerText;

                var backtxt = table.getElementsByTagName("backbtntext")[0];
                var nexttxt = table.getElementsByTagName("nextbtntext")[0];
                var rettxt = table.getElementsByTagName("returnbtntext")[0];
                var backbtn = document.querySelectorAll(".return:not(.replace)>span, .navi-buttons .return-mini>span:not(.ind)");
                var retbtn = document.querySelector(".return.replace");
                var nextbtn = document.querySelectorAll(".navi-buttons .next-page>span:not(.ind)");
                backbtn.forEach(function (b) {
                    b.innerText = backtxt.textContent;
                });
                nextbtn.forEach(function (n) {
                    n.innerText = nexttxt.textContent;
                });
                retbtn.innerText = rettxt.textContent;

                var pages = Array.from(x.getElementsByTagName("page"));

                pages.forEach(function(p){
                    var pageId = p.getAttribute("id");
                    var pageCont = p.getElementsByTagName("text")[0];
                    console.log(pageCont)

                    var pageE = document.querySelector(".page#page-" + pageId);
                    var pageT = document.querySelector('.contents-links>a[data-page="' + pageId +  '"]');

                    var pageNu = pageT.querySelector(".num");
                    var pageTi = pageT.querySelector("span:not(.num)");

                    pageE.querySelector(".pagenum").innerText = pageNu.innerText;
                    pageE.querySelector(".pagetitle").innerText = pageTi.innerText;
                    pageE.querySelector(".text-container").innerHTML = pageCont.innerHTML;
                })

                contents.append(co)
            }

            callback();

        } else {
            console.log("insert error handling up my a")
        }
    }

}

function setLinksListener() {
    var links = document.querySelectorAll("a[data-page]");
    links.forEach(e => {
        e.addEventListener("click", changePage);
    });
}

function setBackButtonListeners() {
    var returnat = document.querySelectorAll("header.default .return:not(.replace), .return-mini");
    var returnre = document.querySelector("header.default .return.replace");
    if (returnre) {
        returnre.addEventListener("click", function(ev) {
            ev.preventDefault();
            console.log("return 2 library")
            location.replace('https://mii.nxw.pw/')
        })
    }
    if (returnat) {
        returnat.forEach(e => {
            e.addEventListener("click", function () {
                console.log("clciked back")
                if (isChanging) {
                    return;
                }
                history.back();
            });
        });
    }
}

function reload() {
    location.replace(location.href);
}


function handlePopstate() {
    if (isChanging) {
        //I dont have the knowledge to handle this
        //This is everything i can do for now, sorry..
        alert("Please use the Manual's Back button!");
        reload();
    }
    console.log("popstate happened")
    var params = new URLSearchParams(location.search);
    var page = params.get("page");
    if (page) {
        replacePageEx(page);
    }
}

function setPopstateListener() {
    window.addEventListener("popstate", handlePopstate)
}

document.addEventListener("DOMContentLoaded", function () {
    initRecipe(function () {
        setLinksListener();
        setBackButtonListeners();
        setPopstateListener();

        replacePageEx("0000");
    })

})