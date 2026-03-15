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
		}
	};
});