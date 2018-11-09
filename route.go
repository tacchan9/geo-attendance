package attendance

import (
	"fmt"
	"net/http"

	// Goji
	"github.com/zenazn/goji"
	"github.com/zenazn/goji/web"

	// html
	"google.golang.org/appengine"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/user"
	"html/template"
)

func init() {
	http.Handle("/", goji.DefaultMux)

	goji.Get("/", index)

	goji.Get("/register", register)


	goji.Get("/list", listView)

	goji.Get("/listCursor", listCursor)

	goji.Get("/exit", exit)
	
	goji.Get("/logout", logout)

	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("css"))))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("js"))))
	http.Handle("/fonts/", http.StripPrefix("/fonts/", http.FileServer(http.Dir("fonts"))))
}

func index(c web.C, w http.ResponseWriter, r *http.Request) {

	funcNm := "index"

	ctx := appengine.NewContext(r)
	u := user.Current(ctx)

	// nologin
	if u == nil {
		loginUrl, _ := user.LoginURL(ctx, "/")
		fmt.Fprintf(w, `<a href="%s">Sign in</a>`, loginUrl)
		return
	}

	log.Infof(ctx, "start %s user: %s\n", funcNm, u)

	data := map[string]interface{}{
		"userEmail": "",
	}

	// page create
	tmpl := template.Must(template.ParseFiles("pages/index.html", "pages/enter.html"))
	tmpl.Execute(w, data)

	log.Infof(ctx, "finish %s user: %s\n", funcNm, u)
}

func exit(c web.C, w http.ResponseWriter, r *http.Request) {

	funcNm := "exit"

	ctx := appengine.NewContext(r)
	u := user.Current(ctx)

	// nologin
	if u == nil {
		loginUrl, _ := user.LoginURL(ctx, "/")
		fmt.Fprintf(w, `<a href="%s">Sign in</a>`, loginUrl)
		return
	}

	log.Infof(ctx, "start %s user: %s\n", funcNm, u)

	data := map[string]interface{}{
		"userEmail": "",
	}

	tmpl := template.Must(template.ParseFiles("pages/index.html", "pages/exit.html"))
	tmpl.Execute(w, data)

	log.Infof(ctx, "finish %s user: %s\n", funcNm, u)
}

func logout(c web.C, w http.ResponseWriter, r *http.Request) {

	//funcNm := "logout"

	ctx := appengine.NewContext(r)
	//u := user.Current(ctx)

	logoutUrl, _ := user.LogoutURL(ctx, "/")
	fmt.Fprintf(w, `<a href="%s">Sign out</a>`, logoutUrl)
	return

}

func listView(c web.C, w http.ResponseWriter, r *http.Request) {

	funcNm := "listView"

	ctx := appengine.NewContext(r)
	u := user.Current(ctx)

	// nologin
	if u == nil {
		loginUrl, _ := user.LoginURL(ctx, "/")
		fmt.Fprintf(w, `<a href="%s">Sign in</a>`, loginUrl)
		return
	}

	log.Infof(ctx, "start %s user: %s\n", funcNm, u)

	data := map[string]interface{}{
		"userEmail": "",
	}

	tmpl := template.Must(template.ParseFiles("pages/index.html", "pages/list.html"))
	tmpl.Execute(w, data)

	log.Infof(ctx, "finish %s user: %s\n", funcNm, u)
}
