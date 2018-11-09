package attendance

import (
	"fmt"

	"net/http"
	"encoding/json"
	"github.com/mjibson/goon"
	"github.com/zenazn/goji/web"
	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/user"
	"math/rand"
	"time"
)

var dataStoreVersion = "1"

var listSize = 3

// rand start
var rs1Letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func RandString1(n int) string {
	rand.Seed(time.Now().UnixNano())
	b := make([]rune, n)
	for i := range b {
		b[i] = rs1Letters[rand.Intn(len(rs1Letters))]
	}
	return string(b)
}

// rand finish



func register(c web.C, w http.ResponseWriter, rq *http.Request) {

	funcNm := "register"

	ctx := appengine.NewContext(rq)
	u := user.Current(ctx)

	// nologin
	if u == nil {
		loginUrl, _ := user.LoginURL(ctx, "/")
		fmt.Fprintf(w, `<a href="%s">Sign in</a>`, loginUrl)
		return
	}

	log.Infof(ctx, "start %s user: %s\n", funcNm, u)

    rType := rq.FormValue("type")
	lon := rq.FormValue("lon")
	lat := rq.FormValue("lat")
	
	log.Infof(ctx, "rType: %s\n", rType)
	log.Infof(ctx, "lon: %s\n", lon)
	log.Infof(ctx, "lat: %s\n", lat)
	
	now := time.Now()
	jst := time.FixedZone("Asia/Tokyo", 9*60*60)
	nowJst := now.In(jst)
	
    nowJstStr := nowJst.String()
	
	id := RandString1(50)

	// datastore
	g := goon.NewGoon(rq)

	record := Records{
		Id:         id,
		IdStr:      id,
		Type:       rType,
		Time:       nowJstStr,
		Latitude:   lat,
		Longitude:  lon,
		User:       u.String(),
		InsertDate: now,
		UpdateDate: now,
		Version:    dataStoreVersion,
	}

	_, err := g.Put(&record)

	if err != nil {
		log.Errorf(ctx, "%s :g.Put %v", funcNm, err)
		panic(fmt.Sprintf("%s :g.Put %v", funcNm, err))
	}

	rj := ResponseJson{Status: "ok", Message: nowJstStr}
	json.NewEncoder(w).Encode(rj)

	log.Infof(ctx, "finish %s user: %s\n", funcNm, u)

}


/*
 * @urlParam nextPageToken
 */
func listCursor(c web.C, w http.ResponseWriter, rq *http.Request) {

	funcNm := "listCursor"

	ctx := appengine.NewContext(rq)
	u := user.Current(ctx)

	// nologin
	if u == nil {
		loginUrl, _ := user.LoginURL(ctx, "/")
		fmt.Fprintf(w, `<a href="%s">Sign in</a>`, loginUrl)
		return
	}

	log.Infof(ctx, "start %s user: %s\n", funcNm, u)


	// query
	q := datastore.NewQuery("Records").Filter("User =", u.String()).Order("-InsertDate").Limit(listSize)


	cursor, err := datastore.DecodeCursor(rq.FormValue("nextPageToken"))
	log.Infof(ctx, "start %s token: %s\n", funcNm, rq.FormValue("nextPageToken"))
	if err == nil {
		q = q.Start(cursor)
	}

	count, err := q.Count(ctx)
	if err != nil {
		log.Errorf(ctx, "%s :q.Count %v", funcNm, err)
		panic(fmt.Sprintf("%s :q.Count %v", funcNm, err))
	}
	log.Infof(ctx, "count: %d", count)

	t := q.Run(ctx)

	recordLists := make([]Records, count)
	idx := 0

	for {
		var records Records
		_, err := t.Next(&records)
		if err == datastore.Done {
			break
		}
		if err != nil {
			log.Errorf(ctx, "%s :q.t.Next(&records) %v", funcNm, err)
			break
		}

		log.Infof(ctx, "%v", records)
		recordLists[idx].Id = records.IdStr
		recordLists[idx].Type = records.Type
		recordLists[idx].Time= records.Time
		recordLists[idx].Latitude = records.Latitude
		recordLists[idx].Longitude = records.Longitude

		idx++
	}

	cursor, _ = t.Cursor()

	rj := ResponseJson{Status: "ok", RecordDatas: recordLists, NextPageToken: cursor.String(), ListSize: len(recordLists)}
	json.NewEncoder(w).Encode(rj)

	log.Infof(ctx, "finish %s user: %s\n", funcNm, u)

}
