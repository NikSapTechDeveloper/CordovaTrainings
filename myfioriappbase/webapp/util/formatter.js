sap.ui.define([],function(){
	return{
		getStatus: function(value){
			switch (value) {
				case "Available":
					return 'Success';
				case "Out of Stock":
					return 'Warning';
				case "Discontinued":
					return 'Error';
				default:
			}
		},
		getBase64ToImage: function(base64){
			let imgStr = '';
			
			if(base64){
                if (base64.startsWith('data:image')) {
              imgStr = base64; // It's already formatted
                } else {
              imgStr = "data:image/jpeg;base64," + base64; // Manual prepend
                }
				
			}
			return imgStr;
		},
		getSyncStatus: function(value){
			switch (value) {
				case 1:
					return 'Success';
				case 0:
					return 'Error';
				default:
			}
		},
		getSyncText: function(value){
			switch (value) {
				case 1:
					return 'Server is in sync';
				case 0:
					return 'Not yet saved to SAP';
				default:
			}
		},
	};
});