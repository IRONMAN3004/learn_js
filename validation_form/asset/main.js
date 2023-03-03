function Validator(options) {

    var selectorRules = {};

    //-============================== Hàm thực hiện validate================================
    function validate(inputElement, rule) {

        var errorElement = inputElement.parentElement.querySelector(options.errorSelect);
        //Lấy ra các rules của selectorRules
        var rules = selectorRules[rule.selector];
        var errorMessage;
        // console.log(selectorRules[rule.selector]);
        // console.log(selectorRules);

        //Lặp qua từng rule()kiểm tra 
        //Nếu có lỗi thì dừng việc kiẻme tra 
        for (var i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) {
                break;
            };
        }

        //   console.log(rules);

        if (errorMessage) {
            errorElement.innerHTML = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        } else {
            errorElement.innerHTML = '';
            inputElement.parentElement.classList.remove('invalid');
        }
        //  console.log(errorMessage);
        return !errorMessage; // undifined //errorMessage ở đây sẽ là true hoặc false nó ở 
        //trong hàm is_tên Rule chỗ return toán tử 3 ngôi
    }

    var formElement = document.querySelector(options.form);

    if (formElement) {
        //===========Khi submit form================================
        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;

            //lặp qua từng rules và validate 
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule); //tức hàm validate nó return ra !errorMessage

                if (!isValid) { //nếu chỉ cần 1 oong mà ko Valid
                    isFormValid = false;
                } //Tức neeus 1 iput bị lỗi nó sẽ trả ra 1 errorMessage từ các hàm rules
                //vào hàm validate thì nó return trả về phủ định của errorMessage đó 


            });


            //  console.log(isFormValid);
            // if (isFormValid) {
            //     console.log('ko có lỗi');
            // } else {
            //     console.log('có lỗi');
            // }

            if (isFormValid) {
                //trường hợp submit vs Jsscript
                if (typeof options.onsubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');

                    var formValues = Array.from(enableInputs).reduce(function(value, input) {
                        value[input.name] = input.value;
                        return value;
                    }, {})

                    options.onsubmit(formValues);
                } else { //submit với hành vi mặc định
                    formElement.submit();
                }
            } else {
                var enableInputs = formElement.querySelectorAll('[name]');

                var formValues = Array.from(enableInputs).reduce(function(value, input) {
                    value[input.name] = input.value;
                    return value;
                }, {})

                options.onsubmit(formValues);
            }
        }


        //Xử lý lặp qua mỗii rule và xử lý(lắng nghe sự kiện )
        options.rules.forEach(function(rule) {
            //Lưu lại các rules cho mỗi input 
            // console.log(selectorRules[rule.selector]);
            // Sử dụng dấu ngoặc vuông để làm key của object [rule.select] ở đây rule.select vd như ở đây key sẽ là password
            // selectorRules[rule.selector] = rule.test; //rule.test ở đây là hàm rule của inputs

            /*== Ý TƯỞNG ===================================================*/
            //khi gán dấu bằng ở dòng tren thì nó sẽ ko lưu đc nhiêu rule mà nó sẽ bị ghì đè
            //nên sẽ phải lưu nó vòng trong 1 mảng
            //Khi nó chưa gắn  selectorRules[rule.selector]  = rule.test; nó sẽ là undifined 
            // nên ta sẽ kiểm tra nếu nó là undifined ta sẽ gán nó bằng 1 mảng và giá 
            //trị đầu tiên của nó là rule.test 
            //Conf nếu  selectorRules[rule.selector]  nó đã là mảng rồi thì push các luật 
            // rule.test vào trong mảng
            //==============================================================

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                //Khi  selectorRules[rule.selector] undifined gán cho nó một cái mảng
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                //============ xử lý khi blur ra ngoai input====================
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                };

                //Xử lý khi người dùng nhập vào input
                inputElement.oninput = function() {
                    var errorElement = inputElement.parentElement.querySelector('.form-message');

                    errorElement.innerHTML = '';
                    inputElement.parentElement.classList.remove('invalid');
                };
            }

        });



        // console.log(selectorRules); // object selectorRules lưu lại những rule của thẻ input
    }
};

//Định nghĩa rules 
// Nguyên tắc của các rules
//1. Khi có lỗi => trả ra message
//2. Khi hợp lệ => không trả ra cái gì cả
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || 'Bạn cần nhập thông tin vào ';
        }
    }
};

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập Email ';
        }
    }
};

Validator.isMinLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || 'Vui lòng nhập dài hơn 6 ký tự ';
        }
    }
};

Validator.isConfirmed = function(selector, getCofirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getCofirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}


/*

--1 CÓ 2 sự kiện 1 là khi blur ra khỏi các input
--2 Là khi ấn submit
 từ hàm gọi validator 
  đến file js gọi các rule 
  vào hàm validator nó sẽ lặp để kiểm tra 1 input sẽ có mấy rule  đoạn  if (Array.isArray(selectorRules[rule.selector])) {
    nó sẽ lưu vào đối tượng selectorRules mà mỗi trường neeus có nhiều rule sẽ lưu vào 1 mảng
    tiếp đến  validate(inputElement, rule);  
    tiếp đến var rules = selectorRules[rule.selector]; tức trường email sẽ có 2 loại nó sẽ lặp qua rồi xong email xẽ đến
     các trường khác password....

       errorMessage = rules[i](inputElement.value); tức luật thức i là vd như luật isEmail rồi truyền giá trj của ô input

       if (errorMessage) thì break

       rồi đến if (errorMessage) { để hiển thị ra lỗi hoặc ko lỗi 

*/