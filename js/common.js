var geo = [];

$(document).ready(function(){
    
	//$('.collapsible').collapsible();
	
    //$('.modal').modal();
    geo = currentGeo();

    $('.menu').sideNav({
        menuWidth: 300,
        edge: 'left',
        closeOnClick: true,
        draggable: false
    });
    
    if (location.pathname == "/") {
    	
    	index('1');
    	
	}
	
	if (location.pathname == "/exit") {
    	index('2');
    	
    	
	}


    if (location.pathname == "/driveListView") {
    	
    	getSuggest('toEmail');
    	
    	$('#downloadBtn').click(function(){
    		downloadCsv();
    	} );
    	
    	$('#searchForm').show();
    	
   		$('#search').keypress(function(e) {
			if ( e.which == 13 ) {
				$("#driveDatas").empty();
				$('#preloader').show();
				getDriveList("root", "");
				return false;
			}
		} );
    	
    	getDriveList("root", "");

    	$('#toEmail').blur(function(){
    		
    		var email = $('#toEmail').val();
	
			if (email == "") {
				return
			}
	
    		$.ajax({
    			type: 'POST',
    			url: '/userCheck',
    			data: {
      				'userEmail': email,
    			},
    			dataType: 'json'
    
  			}).done(function(response, textStatus, jqXHR) {
  	
  				if (response.Status == "ok") {
  					$('#changeBtn').removeClass("disabled");
  		
  				} else {
  					toastMsg("Emailが正しくありません");
  				}
  	
  			}).fail(function(jqXHR, textStatus, errorThrown ) {
  				toastMsg("エラーが発生しました");
  	
  			}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
  			});
		});		
    }
    
    if (location.pathname == "/statusListView") {
    	
    	//$('#searchForm').show();
    	
    	//getStatusList("");
    	
    	//$('#search').attr("placeholder", "Name:ファイル名");
    	//$('#search').attr("list", "searchStatus");
    	
   		/*$('#search').keypress(function(e) {
			if ( e.which == 13 ) {
				
				// status
				if ($('#headerStatus').is(':visible')) {
					searchStatusList();
					
				// info
				} else {
					
					if ($('#search').val() != "") {
						
						if ($('#search').val().indexOf('Result:') != 0
						    && $('#search').val().indexOf('Name:') != 0
						    && $('#search').val().indexOf('Date:') != 0) {
					    	
							toastMsg("検索条件が正しくありません");
							return false
						}
					}
					
					$('#statusInfoDatas').empty();
					
					getStatusInfo($('tr[class="blue white-text"]').attr('statusId'), '');
					
				}
				return false;
			}
		} );*/
		getList();
    }
    		
	if (location.pathname == "/logout") {
    	
    	window.location.href = $('#logoutUrl').text();

	}

});

var currentGeo = function() {
	
	var geo = [0, 0];
	
	if( navigator.geolocation ){// 現在位置を取得できる場合の処理
      // 現在位置を取得する
      navigator.geolocation.getCurrentPosition( success, error, option);
      /*現在位置が取得できた時に実行*/
      function success(position){
        var data = position.coords;
        // 必要な緯度経度だけ取得
        //var lat = data.latitude;
        //var lng = data.longitude;
        alert(data.latitude);
        alert(data.longitude);
        
        geo[0] = data.latitude;
        geo[1] = data.longitude;
      }
    }
    
    return geo;
};

function error(error){
    var errorMessage = {
      0: "原因不明のエラーが発生しました。",
      1: "位置情報が許可されませんでした。",
      2: "位置情報が取得できませんでした。",
      3: "タイムアウトしました。",
    } ;
    //とりあえずalert
    //alert( errorMessage[error.code]);
}

// オプション(省略可)
var option = {
    "enableHighAccuracy": false,
    "timeout": 100 ,
    "maximumAge": 100 ,
};

var index = function(type) {
	
  var app = new Vue({
    el: '#app',
    data: {
      date: moment().format("YYYY-MM-DD"),
     //geo: currentGeo()
    },
    methods: {
      enter: function (event) {
      	//var geo = currentGeo();
      	axios
        .get('/register',
          {
            params: {
              type: type,
              lon: geo[1],
              lat: geo[0]
          }
        })
        //.then(response => (this.info = response))
        .then(function(response) {
        	//alert(response.data['disclaimer']);
        	if (type == '1') {
        	  toastMsg("入室しました");
        		
        	} else {
        	  toastMsg("退室しました");
        		
        	}
        });
      },
    }
  });
}




var hierarchy = 0;
var selectDriveIdTmp = "";
var listSize = 10;

var toastMsg = function(msg) {
	var $toastContent = $('<span>' + msg + '</span>')
		.add($('<button class="btn-flat toast-action" onclick="Materialize.Toast.removeAll();">close</button>'));
		  		
  	Materialize.toast($toastContent, 5000);  	

}

var fromUserCheck = function() {
	userCheck($('#inputUserEmail').val());
	
}

var userCheck = function(email) {
	
	if (email == "") {
		toastMsg("Emailを入力して下さい");
		return
	}
	
    $.ajax({
    	type: 'POST',
    	url: '/userCheck',
    	data: {
      	'userEmail': email,
    	},
    	dataType: 'json'
    
  	}).done(function(response, textStatus, jqXHR) {
  	
  		if (response.Status == "ok") {
  			  		
  			var f = document.forms["form"];
  			f.method = "POST"; 
  			f.action = "/driveListView";
  			f.submit(); 
  		
  		} else {
  			toastMsg("Emailが正しくありません");
  		}
  	
  	}).fail(function(jqXHR, textStatus, errorThrown ) {
  		toastMsg("エラーが発生しました");
  	
  	}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
  	});
}

var getDriveList = function(driveId, nextPageToken) {
	
	var userEmail = $('#userEmail').text();
	
	if (userEmail == "") {
		window.location.href = '/';
	}
		
    $.ajax({
    	type: 'POST',
    	url: '/driveList',
    	data: {
      		'userEmail': userEmail,
			'driveId': driveId,
			'nextPageToken': nextPageToken,
			'searchTxt': $('#search').val()
    	},
    	dataType: 'json'
    
  	}).done(function(response, textStatus, jqXHR) {
  		
  		$('#preloader').hide();
  	
  		if (response.Status == "ok") {

			$('#driveId').val(driveId);
			$('#nextPageToken').val(response.NextPageToken);

        	var driveDatas = response.DriveDatas;
        	for (var i=0; i<driveDatas.length; i++) {
          		var row = '<tr ';
          		
          		row += 'driveId="' + driveDatas[i].Id + '" ';
          		row += 'driveNm="' + driveDatas[i].Name + '" ';
          		row += 'MimeType="' + driveDatas[i].MimeType + '" ';
          		row += 'Owner="' + driveDatas[i].Owner + '" ';
          		row += 'PermissionId="' + driveDatas[i].PermissionId + '" ';
          		
          		row += '><td class="driveInfo" data-activates="driveInfo">';
          		
          		/*if (driveDatas[i].MimeType == "application/vnd.google-apps.folder") {
          			row += '<i class="material-icons">folder</i></td>';
          		} else {
          			row += icon(driveDatas[i].MimeType) + '</td>';
          		}*/
          		row += '<img src="'+ driveDatas[i].IconLink + '" alt="" class="responsive-img"></td>'
          		row += '<td>' + driveDatas[i].Name + '</td>';
          		row += '<td class="ownerchange" data-activates="ownerchange">' + driveDatas[i].Owner + '</td>';
          		row += '</tr>';

          		$('#driveDatas').append(row);
			}
			
			if($('#more').length){
				$('#more').remove();
			}
			
			// clear
			$('table[name="driveList"] tr[name!="header"]').prop('onclick', null).off('click');
			$('table[name="driveList"] tr[name!="header"]').prop('ondblclick', null).off('dblclick');
			        	
        	$('table[name="driveList"] tr[name!="header"]').click(function() {
          		$('table[name="driveList"] tr[name!="header"]').removeClass("blue");
          		$('table[name="driveList"] tr[name!="header"]').removeClass("white-text");
          		
          		$(this).addClass("blue");
          		$(this).addClass("white-text");
          		
        	});
        	
        	$('table[name="driveList"] tr[name!="header"]').dblclick(function() {
        		
                hierarchy++;
                
        		selectDriveId($(this).attr("MimeType"), $(this).attr("driveId"), $(this).attr("driveNm"));
			});

			// more
			if (response.NextPageToken != "") {
				var more = '<tr id="more" onclick="getDriveList(' + "'" + driveId + "', '" + response.NextPageToken + "'";
				more += ')"><td colspan="3" class="blue-text"><div align="center">もっと見る</div></td></tr>';
				
				$('#driveDatas').append(more);
			}
        	
        	$('.ownerchange').sideNav({
        		menuWidth: 300,
        		edge: 'right',
        		closeOnClick: true,
        		draggable: false,
        		onOpen: function() {
          			$('table[name="driveList"] tr[name!="header"]').removeClass("blue");
          			$('table[name="driveList"] tr[name!="header"]').removeClass("white-text");
          		
          			$(this).parent().addClass("blue");
          			$(this).parent().addClass("white-text");
          			
          			if (selectDriveIdTmp != $(this).parent().attr("driveId")) {
          				// clear
          				$('#toEmail').val("");
          				$("#changeBtn").addClass("disabled");

          			}
          			
          			selectDriveIdTmp = $(this).parent().attr("driveId");

        		}
      		});
      		
      		$('.driveInfo').sideNav({
        		menuWidth: 500,
        		edge: 'right',
        		closeOnClick: true,
        		draggable: false,
        		onOpen: function() {
          			$('table[name="driveList"] tr[name!="header"]').removeClass("blue");
          			$('table[name="driveList"] tr[name!="header"]').removeClass("white-text");
          		
          			$(this).parent().addClass("blue");
          			$(this).parent().addClass("white-text");
          			
          			$('#diMimeType').text("");
					$('#diModifiedTime').text("");
					$('#diCreatedTime').text("");
					$('#diShare').html("");
					
					var driveId = $(this).parent().attr("driveId");
					var mimeType = $(this).parent().attr("mimeType");
					var driveNm = $(this).parent().attr("driveNm");
          			
        			$.ajax({
						type: 'POST',
						url: '/getDriveInfo',
						data: {
							'fromUser': $('#userEmail').text(),
      						'driveId': $(this).parent().attr("driveId"),
    					},
						dataType: 'json'

					}).done(function(response, textStatus, jqXHR) {
  
						if (response.Status == "ok") {
							$('#diMimeType').text(response.MimeType);
							$('#diModifiedTime').text(response.ModifiedTime);
							$('#diCreatedTime').text(response.CreatedTime);
							$('#diShare').html(response.Share.replace(/,/g, "<br>")
									.replace(/user:/g, '<i style="vertical-align:middle;" class="material-icons prefix">account_box</i>')
									.replace(/group:/g, '<i style="vertical-align:middle;" class="material-icons prefix">group</i>')
									.replace(/domain:/g, '<i style="vertical-align:middle;" class="material-icons prefix">domain</i>')
									.replace(/anyone:/g, '<i style="vertical-align:middle;" class="material-icons prefix">wb_cloudy</i>'));
									
							$('#fileDlBtn').prop('onclick', null).off('click');
		
							$('#fileDlBtn').click(function(){
    							fileDownload(mimeType, driveId, driveNm);
    						} );
    						
    						if (mimeType == "application/vnd.google-apps.folder") {
    							$("#fileDlBtn").addClass("disabled");
    						} else {
    							$("#fileDlBtn").removeClass("disabled");
    						}

						}
  
					}).fail(function(jqXHR, textStatus, errorThrown ) {
						toastMsg("エラーが発生しました");
  
					}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
					});

        		}
      		});

    	}
  	
  	}).fail(function(jqXHR, textStatus, errorThrown ) {
  		toastMsg("エラーが発生しました");
  	
  	}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {  	
  	});
}

var getStatusList = function(nextPageToken) {
			
    $.ajax({
    	type: 'POST',
    	url: '/statusListCursor',
    	data: {
      		'nextPageToken': nextPageToken,
      		'searchTxt': $('#search').val()
    	},
    	dataType: 'json'
    
  	}).done(function(response, textStatus, jqXHR) {
  		
  		$('#preloader').hide();
  	
  		if (response.Status == "ok") {
        	var statusDatas = response.StatusDatas;
        	
			if($('#more').length){
				$('#more').remove();
			}
        	
        	for (var i=0; i<statusDatas.length; i++) {
          		var row = '<tr ';
          		
          		row += 'statusId="' + statusDatas[i].Id + '" ';
          		row += '>';
          		row += '<td>' + statusDatas[i].InsertDate.split(".")[0] + '<br>' + statusDatas[i].User + '</td>';
          		
          		if (statusDatas[i].MimeType == "application/vnd.google-apps.folder") {
          			row += '<td><i class="material-icons">folder</i></td>';
          		} else {
          			row += '<td>' + icon(statusDatas[i].MimeType) + '</td>';
          		}
          		row += '<td>' + statusDatas[i].DriveNm + '<br>' + statusDatas[i].Note + '</td>';
          		row += '<td>' + statusDatas[i].From + '<br>' + statusDatas[i].To + '</td>';
          		
          		if (statusDatas[i].Accept == "OK") {
	          		row += '<td><div class="green-text">' + statusDatas[i].Accept + '</div></td>';
          		} else {
	          		row += '<td><div class="red-text">' + statusDatas[i].Accept + '</div></td>';
          			
          		}
          		row += '</tr>';
          		

          		$('#statusDatas').append(row);
        	}
        	
			// clear
			$('table tr').prop('onclick', null).off('click');
			$('table tr').prop('ondblclick', null).off('dblclick');
        	
        	$('table tr').click(function() {
          		$('table tr').removeClass("blue");
          		$('table tr').removeClass("white-text");
          		
          		$(this).addClass("blue");
          		$(this).addClass("white-text");          		
        	});
        	
        	$('table tr').dblclick(function() {
        		$('#search').val("");
        		$('#search').attr("list", "searchStatusInfo");
        		
        		getStatusInfo($(this).attr("statusId"), '');
        	});
        	
        	// more
			if (response.NextPageToken != ""　&& listSize <= parseInt(response.ListSize)) {
				var more = '<tr id="more" onclick="getStatusList(' + "'" + response.NextPageToken + "'";
				more += ')"><td colspan="5" class="blue-text"><div align="center">もっと見る</div></td></tr>';
				
				$('#statusDatas').append(more);
			}

    	}
  	
  	}).fail(function(jqXHR, textStatus, errorThrown ) {
  		toastMsg("エラーが発生しました");
  	
  	}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {  	
  	});
}

var getList = function(nextPageToken) {
			
    $.ajax({
    	type: 'POST',
    	url: '/statusListCursor',
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


var getStatusInfo = function(statusId, nextPageToken) {

	$('#headerStatus').hide();
	$('#statusDatas').hide();
	$('#statusBack').show();
	$('#headerStatusInfo').show();
	$('#statusInfoDatas').show();
	$('#preloader').show();
	
	$.ajax({
    	type: 'POST',
    	url: '/statusInfoListCursor',
    	data: {
      		'statusId': statusId,
      		'nextPageToken': nextPageToken,
      		'searchTxt': $('#search').val()
    	},
    	dataType: 'json'
    
  	}).done(function(response, textStatus, jqXHR) {
  		
  		$('#preloader').hide();
  	
  		if (response.Status == "ok") {
        	var statusInfoDatas = response.StatusInfoDatas;
        	
        	if($('#moreInfo').length){
				$('#moreInfo').remove();
			}

        	for (var i=0; i<statusInfoDatas.length; i++) {
          		var row = '<tr>';
          		
          		row += '<td>' + statusInfoDatas[i].InsertDate.split(".")[0] + '</td>';
          		
          		if (statusInfoDatas[i].MimeType == "application/vnd.google-apps.folder") {
          			row += '<td><i class="material-icons">folder</i></td>';
          		} else {
          			row += '<td>' + icon(statusInfoDatas[i].MimeType) + '</td>';
          		}
          		row += '<td>' + statusInfoDatas[i].DriveNm + '</td>';
          		
          		if (statusInfoDatas[i].Result == "OK") {
	          		row += '<td class="green-text">' + statusInfoDatas[i].Result + '</td>';
          		} else {
	          		row += '<td class="red-text">' + statusInfoDatas[i].Result + '</td>';
          			
          		}
          		row += '</tr>';

          		$('#statusInfoDatas').append(row);          		

        	}
        	
        	// more
			if (response.NextPageToken != ""　&& listSize <= parseInt(response.ListSize)) {
				var more = '<tr id="moreInfo" onclick="getStatusInfo(' + "'" + statusId +"','" + response.NextPageToken + "'";
				more += ')"><td colspan="4" class="blue-text"><div align="center">もっと見る</div></td></tr>';
				
				$('#statusInfoDatas').append(more);
			}
        	        	
    	}
  	
  	}).fail(function(jqXHR, textStatus, errorThrown ) {
  		toastMsg("エラーが発生しました");
  	
  	}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {  	
  	});

}

var statusBack = function() {
	
	$('#statusInfoDatas').empty();
	
	$('#headerStatusInfo').hide();
	$('#statusInfoDatas').hide();
	$('#headerStatus').show();
	$('#statusDatas').show();
	$('#statusBack').hide();
	
	$('#search').val("");
	$('#search').attr("list", "searchStatus");
}


var selectDriveId = function(mimeType, driveId, driveNm) {
	
	if (mimeType != "application/vnd.google-apps.folder") {
		
		//fileDownload(mimeType, driveId, driveNm);
		return
	}
	
	$('#search').val("");
	
	var row = '<li ';
	for (var i=1; i<hierarchy+1; i++) {
		row += 'hierarchy' + i + '=on ';
	}
	row += '><a class="blue-text" href="javascript:void(0)" onclick="';
	row += 'clickHierarchy(' + hierarchy + ', ';
	row += "'application/vnd.google-apps.folder', '";
	row += driveId + "', '" + driveNm + "'";
	row += ')">' + driveNm + '</a></li>';
	
	$('#divider').append(row);
	$("#driveDatas").empty();
	$('#preloader').show();
	$('#current').text(driveNm);
	
	getDriveList(driveId, "");
	
}

var clickHierarchy = function(target, mimeType, driveId, driveNm) {
	
	hierarchy = target;
	
	$('li[hierarchy' + target +'=on]').remove();
	
	$('#search').val("");
	
	selectDriveId(mimeType, driveId, driveNm);
}


var clickMyDrive = function() {
		
	$("#divider").empty();
	$("#driveDatas").empty();
	$('#preloader').show();
	$('#current').text("マイドライブ");
	
	hierarchy = 0;

	$('#search').val("");
	
	getDriveList("root", "");
	
}

var ownerChange = function() {
	
	var fromUser = $('#userEmail').text();
    var toUser = $('#toEmail').val();
 	var driveId = selectDriveIdTmp;
    var driveNm = $('tr[driveId=' + driveId +']').attr("driveNm");
    var mimeType = $('tr[driveId=' + driveId +']').attr("mimeType");
    var owner = $('tr[driveId=' + driveId +']').attr("owner");
    var permissionId = $('tr[driveId=' + driveId +']').attr("permissionId");
    
    $.ajax({
    	type: 'POST',
    	url: '/ownerChange',
    	data: {
      		'fromUser': fromUser,
      		'toUser': toUser,
      		'driveId': driveId,
      		'driveNm': driveNm,
      		'mimeType': mimeType,
      		'owner': owner,
      		'permissionId': permissionId
    	},
    	dataType: 'json'
    
  	}).done(function(response, textStatus, jqXHR) {
  	
  		if (response.Status == "ok") {
  			toastMsg("処理を受付ました");
  			
  			setTimeout("location.reload()",3000);
  			  		  		
  		} else {
  			toastMsg("処理を受付出来ませんでした");
  		}
  	
  	}).fail(function(jqXHR, textStatus, errorThrown ) {
  		toastMsg("エラーが発生しました");
  	
  	}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
  	});
    
}
var taskCancel = function() {
	    
    $.ajax({
    	type: 'POST',
    	url: '/taskQueuePurge',
    	dataType: 'json'
    
  	}).done(function(response, textStatus, jqXHR) {
  	
  		if (response.Status == "ok") {
  			toastMsg("処理を受付ました");
  			  			  		  		
  		} else {
  			toastMsg("処理を受付出来ませんでした");
  		}
  	
  	}).fail(function(jqXHR, textStatus, errorThrown ) {
  		toastMsg("エラーが発生しました");
  	
  	}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
  	});
    
}

var upload = function() {
	
	if ($('#inputFile').val().length == 0) {
		toastMsg("ファイルを選択して下さい");
		return
	}
	
	var reader = new FileReader();

    reader.onload = function(e){
        if (reader.result.split("\n").length > 500) {
			toastMsg("ファイルを500行以下にして下さい");
        	return

        }
	
    	$.ajax({
    		type: 'POST',
    		url: '/upload',
    		processData : false,
			contentType : false,
			data: new FormData($("#uploadForm")[0]),
			dataType: 'json'
    
  		}).done(function(response, textStatus, jqXHR) {
  	
  			if (response.Status == "ok") {
  				toastMsg("処理を受付ました");
  			  		
  			} else {
  				toastMsg("ファイルが正しくありません");
  			}
  	
  		}).fail(function(jqXHR, textStatus, errorThrown ) {
  			toastMsg("エラーが発生しました");
  	
  		}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
  		});
  		
    };

    reader.readAsText($('#inputFile')[0].files[0]);

}

var downloadCsv = function() {
	
    var csvDataTxt = "";
    var rowData;
    var colData;
    var separator = ","

    $("#driveDatas tr").each(function(rowIdx, row) {
    	
    	if ($(row).attr("id") != "more") {
    		csvDataTxt += $(row).attr("owner") + separator;
	        csvDataTxt += $(row).attr("owner") + separator;
	        csvDataTxt += $(row).attr("driveid") + separator;
	        csvDataTxt += $(row).attr("drivenm");
	        csvDataTxt += "\r\n";

    	}
    });
    
    if (csvDataTxt == "") {
            return false;
    }
    
    csvDataTxt =  "変更元アカウント,変更先アカウント,ファイル(またフォルダ)ID,ファイル(またフォルダ)名\r\n" + csvDataTxt;
    
    var blob = new Blob([csvDataTxt] , {
    	type: "text/csv;charset=utf-8;"
	});
	
	var downloadLink = $('<a>ここからダウンロード</a>');
    downloadLink.attr('href', window.URL.createObjectURL(blob));
    downloadLink.attr('download', 'driveList.csv');
    downloadLink.attr('target', '_blank');
    
    var $toastContent = $('<div />').append(downloadLink);
		  		
  	Materialize.toast($toastContent, 5000);  	

}
var searchStatusList = function() {
	if ($('#search').val() != "") {
						
		if ($('#search').val().indexOf('Date:') != 0
			&& $('#search').val().indexOf('User:') != 0
			&& $('#search').val().indexOf('Name:') != 0
			&& $('#search').val().indexOf('CsvName:') != 0
			&& $('#search').val().indexOf('From:') != 0
			&& $('#search').val().indexOf('To:') != 0
			&& $('#search').val().indexOf('Result:') != 0) {
					    	
			toastMsg("検索条件が正しくありません");
			return false
		}
	}
					
	$('#statusDatas').empty();
					
	getStatusList('');

}
					

var icon = function(mimeType) {
	
	var iconStr = '<i class="material-icons">insert_drive_file</i>';
	
	// word
	if (mimeType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
		iconStr = '<i class="material-icons blue-text text-lighten-1">description</i>';
	
	// excel
	} else if (mimeType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
		iconStr = '<i class="material-icons green-text">description</i>';
		
	// powerpaint
	} else if (mimeType == "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
		iconStr = '<i class="material-icons red-text">description</i>';
		
	// document
	} else if (mimeType == "application/vnd.google-apps.document") {
		iconStr = '<i class="material-icons blue-text text-lighten-1">insert_drive_file</i>';
		
	// spreadsheet
	} else if (mimeType == "application/vnd.google-apps.spreadsheet") {
		iconStr = '<i class="material-icons green-text">insert_drive_file</i>';
		
	// slide
	} else if (mimeType == "application/vnd.google-apps.presentation") {
		iconStr = '<i class="material-icons orange-text">insert_drive_file</i>';
		
	}
	
	return iconStr;
}

var getTask = function() {
		$.ajax({
			type: 'POST',
			url: '/taskQueueInfo',
			dataType: 'json'

		}).done(function(response, textStatus, jqXHR) {
  
			if (response.Status == "ok") {
				$('#taskCnt').text(response.ListSize);

				  if (response.ListSize == "0") {
					$('#taskMsg').text("実行中のタスクはありません");
					  
				  } else {
					$('#taskMsg').text(response.ListSize + "のタスクが実行中です");					  
				  }	  
			}
  
		}).fail(function(jqXHR, textStatus, errorThrown ) {
			  toastMsg("エラーが発生しました");
  
		}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
		});
}

var getNgStatusInfo = function(nextPageToken) {

	$.ajax({
    	type: 'POST',
    	url: '/statusInfoNgListCursor',
    	data: {
      		'nextPageToken': nextPageToken,
    	},
    	dataType: 'json'
    
  	}).done(function(response, textStatus, jqXHR) {
  		
  		$('#preloader').hide();
  	
  		if (response.Status == "ok") {
        	var statusInfoDatas = response.StatusInfoDatas;
        	
        	if($('#moreInfo').length){
				$('#moreInfo').remove();
			}

        	for (var i=0; i<statusInfoDatas.length; i++) {
          		var row = '<tr class="nginfo" data-activates="nginfo" ';
          		row += 'parnetId="' + statusInfoDatas[i].ParnetId + '" >';
          		
          		row += '<td>' + statusInfoDatas[i].InsertDate.split(".")[0] + '</td>';
          		
          		if (statusInfoDatas[i].MimeType == "application/vnd.google-apps.folder") {
          			row += '<td><i class="material-icons">folder</i></td>';
          		} else {
          			row += '<td>' + icon(statusInfoDatas[i].MimeType) + '</td>';
          		}
          		row += '<td>' + statusInfoDatas[i].DriveNm + '</td>';
          		
	          	row += '<td class="red-text">' + statusInfoDatas[i].Result + '</td>';
          			
          		row += '</tr>';

          		$('#statusInfoDatas').append(row);          		

        	}
        	
        	// more
			if (response.NextPageToken != ""　&& listSize <= parseInt(response.ListSize)) {
				var more = '<tr id="moreInfo" onclick="getNgStatusInfo(' + "'"+ response.NextPageToken + "'";
				more += ')"><td colspan="4" class="blue-text"><div align="center">もっと見る</div></td></tr>';
				
				$('#statusInfoDatas').append(more);
			}
			
			$('.nginfo').sideNav({
        		menuWidth: 500,
        		edge: 'right',
        		closeOnClick: true,
        		draggable: false,
        		onOpen: function() {
        			$.ajax({
						type: 'POST',
						url: '/getNgStatus',
						data: {
      						'IdStr': $(this).attr("parnetId"),
    					},
						dataType: 'json'

					}).done(function(response, textStatus, jqXHR) {
  
						if (response.Status == "ok") {
							$('#ngDate').text(response.StatusDatas[0].InsertDate);
							$('#ngUser').text(response.StatusDatas[0].User);
							$('#ngName').text(response.StatusDatas[0].DriveNm);
							$('#ngCsvName').text(response.StatusDatas[0].Note);
							$('#ngFrom').text(response.StatusDatas[0].From);
							$('#ngTo').text(response.StatusDatas[0].To);
						}
  
					}).fail(function(jqXHR, textStatus, errorThrown ) {
						toastMsg("エラーが発生しました");
  
					}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
					});

        		}
      		});
        	        	
    	}
  	
  	}).fail(function(jqXHR, textStatus, errorThrown ) {
  		toastMsg("エラーが発生しました");
  	
  	}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {  	
  	});

}

var setSuggest = function() {
	    
    $.ajax({
    	type: 'POST',
    	url: '/setSuggest',
    	data: {
      		'adminEmail': $('#adminEmail').val(),
    	},
    	dataType: 'json'
    
  	}).done(function(response, textStatus, jqXHR) {
  	
  		if (response.Status == "ok") {
  			toastMsg("設定しました");
  			  			  		  		
  		} else {
  			toastMsg("設定出来ませんでした");
  		}
  	
  	}).fail(function(jqXHR, textStatus, errorThrown ) {
  		toastMsg("エラーが発生しました");
  	
  	}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
  	});
    
}

var getSuggest = function(target) {
	    
		$.ajax({
    		type: 'POST',
    		url: '/getSuggest',
    		dataType: 'json'
    
  		}).done(function(response, textStatus, jqXHR) {
  	
  			if (response.Status == "ok") {
  				//suggest
  				var users = response.Users.split(',');

  				var suggestDatas = {};
  				$.each(users, function(i, value) {
  					suggestDatas[value] = null;
  					
  				});
  				
				//$('#inputUserEmail').autocomplete({
				$("#" + target).autocomplete({
    				data: suggestDatas,
    				limit: 20,
    				onAutocomplete: function(val) {
    				// Callback
    				},
    				minLength: 1, 
				});

  			}
  	
  		}).fail(function(jqXHR, textStatus, errorThrown ) {
  				toastMsg("エラーが発生しました");
  	
  		}).always(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
  		});
}

var fileDownload = function(mimeType, driveId, driveNm) {
	
	var param = "fromUser=" + $('#userEmail').text();
	param += "&mimeType=" + mimeType;
	param += "&driveId=" + driveId;
	param += "&driveNm=" + driveNm;
	
	location.href = "/fileDownload?" + param;
	
}
