package attendance

type ResponseJson struct {
	Status          string
	Message         string
	Users           string
	ListSize        int
	RecordDatas     []Records
	NextPageToken   string
}