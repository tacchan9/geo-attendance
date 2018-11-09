var listSize = 10;

$(document).ready(function(){    

    $('.menu').sideNav({
        menuWidth: 300,
        edge: 'left',
        closeOnClick: true,
        draggable: false
    });
    
    if (location.pathname == "/") {
    	register('1');
    }
	
	if (location.pathname == "/exit") {
    	register('2');    	
	}
    
    if (location.pathname == "/list") {	
		getListVue();
    }
    		
	if (location.pathname == "/logout") {    	
    	window.location.href = $('#logoutUrl').text();

	}

});

function error(error){
    var errorMessage = {
      0: "原因不明のエラーが発生しました。",
      1: "位置情報が許可されませんでした。",
      2: "位置情報が取得できませんでした。",
      3: "タイムアウトしました。",
    } ;
    alert( errorMessage[error.code]);
}

// オプション(省略可)
var option = {
    /*"enableHighAccuracy": false,
    "timeout": 500 ,
    "maximumAge": 500 ,*/
};

var register = function(type) {
	
  var app = new Vue({
    el: '#app',
    delimiters: ['${', '}'],
    data: {
      date: moment().format("YYYY-MM-DD"),
      message: 'abc'
    },
    methods: {
      enter: function (event) {
      	
      	if( navigator.geolocation ){
      		navigator.geolocation.getCurrentPosition( function(position) {
        		var data = position.coords;        
        		
		      	axios
		        .get('/register',
		          {
		            params: {
		              type: type,
		              lon: data.longitude,
		              lat: data.latitude
		          }
		        })
		        .then(function(response) {
		        	if (type == '1') {
		        	  toastMsg("入室しました");
		        		
		        	} else {
		        	  toastMsg("退室しました");
		        		
		        	}
		        	$('#txt').text(response.data.Message);
		        	//this.message = response.data['Message'];
		        });
      			
      		}, error, option);      
	    }    

      },
    }
  });
}

var toastMsg = function(msg) {
	var $toastContent = $('<span>' + msg + '</span>')
		.add($('<button class="btn-flat toast-action" onclick="Materialize.Toast.removeAll();">close</button>'));
		  		
  	Materialize.toast($toastContent, 5000);  	

}
var showInfo = function(){
	alert("abc");

    $('.driveInfo').sideNav({
        menuWidth: 500,
        edge: 'right',
        closeOnClick: true,
        draggable: false,
        onOpen: function() {              
            var latitude = $(this).attr("latitude");
            var longitude = $(this).attr("longitude");
              
              var url = 'https://maps.google.co.jp/maps?output=embed&q=' + latitude + ',' + longitude;
              alert(url);
              
              document.getElementById('map').contentWindow.location.replace(url);
              $('#geo').text(latitude + ',' + longitude);

        }
    });

}

var getListVue = function(nextPageToken) {
	
  new Vue({
    el: '#app',
    delimiters: ['${', '}'],
    data: {
      date: moment().format("YYYY-MM-DD"),
      message: '',

      items: [],
      /*items: [
      { Type: 'Foo' },
      { Type: 'Bar' }
      ]*/
    },
    //prefetch() {
    mounted () {
    axios
      .post('/listCursor',
      //.get('https://api.coindesk.com/v1/bpi/currentprice.json',
		{
			params: {
		    	type: nextPageToken,
		     }
	  })
      //.then(response => (this.message = response.data.Status))
		        /*.then(function(response) {
		        	this.message = response.data.Status;
		        });*/
		.then( response => {
            $('#preloader').hide()

  			this.message = response.data.RecordDatas
            this.items = response.data.RecordDatas
                        //setTimeout(showInfo(), 5000)

                        
            
		})
		
		//todo error
    },
    updated () {
    	showInfo();
    },
    methods: {
        select: function (event) {
            $('table tr').removeClass("blue");
            $('table tr').removeClass("white-text");
            
            event.currentTarget.className += " blue white-text";
        }
    }  
  });

	
}

var getList = function(nextPageToken) {
	
    $.ajax({
    	type: 'POST',
    	url: '/listCursor',
    	data: {
      		'nextPageToken': nextPageToken
    	},
    	dataType: 'json'
    
  	}).done(function(response, textStatus, jqXHR) {
  		
  		$('#preloader').hide();
  	
  		if (response.Status == "ok") {
        	var recordDatas = response.RecordDatas;
        	
			if($('#more').length){
				$('#more').remove();
			}
        	
        	for (var i=0; i<recordDatas.length; i++) {
          		var row = '<tr class="driveInfo" data-activates="driveInfo"';          		
          		row += 'idStr="' + recordDatas[i].Id + '" ';
          		row += 'latitude="' + recordDatas[i].Latitude + '" ';
          		row += 'longitude="' + recordDatas[i].Longitude + '" ';
          		row += '>';
          		
          		if (recordDatas[i].Type == '1') {
          			row += '<td><div class="green-text">入室</div></td>';
          		} else {
          			row += '<td><div class="red-text">退室</div></td>';
          			
          		}
          		
          		//row += '<td>' + recordDatas[i].Type + '</td>';
          		row += '<td>' + recordDatas[i].Time.split(".")[0] + '</td>';
          		row += '</tr>';
          		

          		$('#recordDatas').append(row);
        	}
        	
			// clear
			$('table tr').prop('onclick', null).off('click');
			//$('table tr').prop('ondblclick', null).off('dblclick');
        	
        	$('table tr').click(function() {
          		$('table tr').removeClass("blue");
          		$('table tr').removeClass("white-text");
          		
          		$(this).addClass("blue");
          		$(this).addClass("white-text");          		
        	});
        	
        	/*$('table tr').dblclick(function() {
        		$('#search').val("");
        		$('#search').attr("list", "searchStatusInfo");
        		
        		getStatusInfo($(this).attr("statusId"), '');
        	});*/
        	
        	// more
			if (response.NextPageToken != ""　&& listSize <= parseInt(response.ListSize)) {
				var more = '<tr id="more" onclick="getList(' + "'" + response.NextPageToken + "'";
				more += ')"><td colspan="2" class="blue-text"><div align="center">もっと見る</div></td></tr>';
				
				$('#recordDatas').append(more);
			}
			
      		$('.driveInfo').sideNav({
        		menuWidth: 500,
        		edge: 'right',
        		closeOnClick: true,
        		draggable: false,
        		onOpen: function() {
          			//$('table[name="driveList"] tr[name!="header"]').removeClass("blue");
          			//$('table[name="driveList"] tr[name!="header"]').removeClass("white-text");
          		
          			$(this).parent().addClass("blue");
          			$(this).parent().addClass("white-text");
          			
          			var latitude = $(this).attr("latitude");
					var longitude = $(this).attr("longitude");
          			
          			var url = 'https://maps.google.co.jp/maps?output=embed&q=' + latitude + ',' + longitude;
          			alert(url);
          			
          			document.getElementById('map').contentWindow.location.replace(url);
          			$('#geo').text(latitude + ',' + longitude);

        		}
      		});
			

    	}
  	
  	}).fail(function(jqXHR, textStatus, errorThrown ) {
  		toastMsg("エラーが発生しました");
  	
  	}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {  	
  	});
}
