/*加载中*/
window.onload = function(){
	
	
	EventUtil.addHandler(document.getElementById('clear'),'click',function(){
		localStorage.clear();//清除缓存
		history.go(0);
	});
	
	
	
	initDataBase();
	initCates();

	EventUtil.addHandler(document.querySelector("#li"),"click",AllCateClick);//点击所有任务事件
	EventUtil.addHandler(document.querySelector(".add"),"click",clickAddCate);//点击增加分类按钮的时间
	/*弹窗部分，还没写*/
	EventUtil.addHandler(document.querySelector("#yes"),"click",cateAdd);//点击分类中的确定按钮
	EventUtil.addHandler(document.querySelector("#no"),"click",coverHide);//点击新增分类中的取消按钮


	/*给最左边任务列表部分的 h3 h4 删除  添加监听函数*/
	EventUtil.addHandler(document.querySelector("#list-item"),"click",function(){
		event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);
		
		taskEditHide();
		console.log(target.className);
		console.log(event);
		if(target.className == 'delete  icon-minus-circled' && target.parentNode.tagName.toLowerCase() == 'h3')//点击的是主分类的删除
		{
			deleteCate(event);
		}else if(target.className == 'delete  icon-minus-circled' && target.parentNode.tagName.toLowerCase() == 'h4')//点击的是子分类的删除
		{	
			deleteChildCate(event);
		}else if(target.tagName.toLowerCase()=='h3' || target.parentNode.tagName.toLowerCase()=='h3')//为h3添加点击事件
		{
			cateClick(target);
		}else if(target.tagName.toLowerCase()=='h4' || target.parentNode.tagName.toLowerCase()=='h4')//为h4添加点击事件
		{
			childCateClick(target);
		}
		
		
	});
	
	/*中间任务列表，最上边的所有、已完成、未完成点击监听*/
	
	EventUtil.addHandler(document.querySelector('#status'),'click',function(event){
		
		event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);
		
		if(target.tagName.toLowerCase() == 'li' || target.parentNode.tagName.toLowerCase() == 'li'){
			
			statusClick(target);//如果点击某个某个状态会出现的不同任务列表
		}
		
	});
	
	/*任务列表中间的一些监听事件*/
	
	EventUtil.addHandler(document.querySelector('#type-list'),'click',function(event){
		event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);
		
		taskEditHide();
		console.log(target.className);
		if(target.className === 'delete  icon-minus-circled'){
			
			var res = confirm("确认删除？");
			
			if(res){
				
				//删除任务函数
				deleteTask(target);//target相当于是要删除的那个任务里的h6里的i元素
				
			}
			
		}else if(target.tagName.toLowerCase()=='h6' || target.parentNode.tagName.toLowerCase()=='h6'){
			
			//为点击的元素设置高亮
			setTaskHightLight(target);
			//显示右侧对应的task详情
			taskDisplay();
		}
	
	});
	
	/*点击增加任务按钮增加任务*/
	
	EventUtil.addHandler(document.querySelector("#addTask"),'click',function(event){
		event=EventUtil.getEvent(event);
		var target=EventUtil.getTarget(event);//获取点击增加任务的元素

		clickAddTask();
	});
	
	
	/*中间点击增加任务出来的右侧编辑任务的cancel按钮的点击函数*/
	EventUtil.addHandler(document.querySelector("#cancel"),'click',function(event){
		taskEditHide();
	});
	
	
	
	/*右侧展示界面点击事件*/
	
	EventUtil.addHandler(document.querySelector('.set'),'click',function(event){//这里将来会有问题的
		
		event=EventUtil.getEvent(event);
		var target=EventUtil.getTarget(event);
		
		if(target.className=='icon-ok'){
			
			var rel=confirm('确定标记为已完成么');
			if(rel){
				taskEditFinish();
			}
			
		}else if(target.className=='icon-edit'){
			
			//显示编辑界面  隐藏展示界面
//			document.querySelector('.cont span').style.display='none';
//			document.querySelector('.cont input,#cont-text').style.display='inline';
			
			/*这里改动上边的内容*/
			
			a = document.querySelectorAll('.cont span');
			for (var i = 0; i < a.length; i++) {
				a[i].style.display='none';
			}
			
			b = document.querySelectorAll('.cont input,#cont-text');
			for (var i = 0; i < b.length; i++) {
				b[i].style.display='inline';
			}
			
			
			
			var ele=document.querySelector('h6.choose');
			//console.log(ele);
			var taskid=ele.getAttribute('taskid');
			var taskobj=queryTaskById(parseInt(taskid));

			document.querySelector("#cont-title").value=taskobj.name;
			document.querySelector("#cont-date").value=taskobj.date;
			document.querySelector("#cont-text textarea").value=taskobj.content;
			
			//更改编辑界面按钮的id 因为编辑和新建任务时点击保存的函数是不同的 所以不能id相同
			document.querySelector('#saveOrCancel').querySelector('button').id='edit';
			
		}
		
		
	});
	
	
	/*右侧编辑界面中的点击事件*/
	
	EventUtil.addHandler(document.querySelector("#saveOrCancel"),'click',function(event){
		
		event=EventUtil.getEvent(event);
		var target=EventUtil.getTarget(event);
		
		if(target.id=='edit'){
			console.log('编辑任务');
			taskEdit();
		}else if(target.id=='save'){
			console.log('新建任务');
			var task=queryAllTasks();
			var inTitle=document.querySelector("#cont-title").value;
			var inDate=document.querySelector("#cont-date").value;
			var inContent=document.querySelector("#cont-text textarea").value;

			if(inTitle.length==0){
					alert('任务标题不能为空');
			}else if(getObjByKey(task,'name',inTitle)){
				
				alert('任务标题重复');
				
			}else if(inTitle.length>10){
				
				alert('任务标题不能多于10个字符');
				
			}else if(inDate.length==0){
				
				alert('任务日期不能为空');
				
			}else if(inContent.length==0){
				
				alert('任务内容不能为空');
				
			}else{
				
				//需要判断左侧选中的是哪个子分类
				var chooseChild=document.querySelector('.list .choose');
				var childId=chooseChild.getAttribute('childcateid');//获取选中的子分类的id值
				//console.log(childId);
				//改变子分类中的child数组  改变task数组，增加一个对象
				taskAdd(childId);
				
			}
			
			
		}
		
		
		
	});
	
	
	
}


/*
建立数据库：
分类表：cate里面包含id、name、child  在代码中间加入一个num的属性用于记录在这个主分类下共有多少个未完成的任务
子分类表：childCate里面包含id、pid、name、child
任务表：task里面包含id、pid、finish、name、date、content
*/
//添加事件兼容浏览器的函数

var EventUtil = {
	/*添加时间处理函数兼容浏览器*/
	addHandler:function(element,type,handler){
		
		if(element.addEventListener){//其他浏览器
			
			element.addEventListener(type,handler,false);
		}else if(element.attachEvent){//IE浏览器
			element.attachEvent("on" + type,handler);
		}else{
			element["on" + type] = handler;
		}
		
	},
	
	/*移除事件兼容浏览器*/
	removeHandler:function(element,type,handler){
		
		if(element.removeEventListener)
		{
			element.removeEventListener(type,handler,false);
		}
		else if(element.detachEvent)
		{
			element.detachEvent("on"+type,handler);
		}
		else{
			element["on"+type]=null;
		}
		
	},
	
	/*获取事件目标*/
	getTarget:function(event){
		return event.target || event.srcElement;
	},
	
	/*获取事件*/
	getEvent:function(event){
		return event ? event :window.event;
	},
	
	/*阻止默认事件发生*/
	preventDefault:function(event){
		
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
	},
	
	/*阻止冒泡事件*/
	stopPropagation:function(event){
		
		if(event.stopPropagation){
			event.stopPropagation();
		}else{
			event.cancelBubble = true;
		}
	}
	
}


/*初始化数据库*/

function initDataBase(){
	
	if(!localStorage.cate || !localStorage.childCate || !localStorage.task){
		
		var cateText = [{
			"id":0,
			"name":"默认分类",
			"child":[0]
		}];
		
		var childCateText=[{
			"id":0,
			"name":"默认子分类",
			"child":[0],
			"pid":0
		}];
		
		var taskText=[{
			"id":0,
			"pid":0,
			"name":"使用说明",
			"finish":true,//表明任务是否为完成状态
			"date":"2016-07-20",
			"content":"左侧为分类列表<br/>右侧为当前分类下的任务列表<br/>右侧为任务详情<br/>可以添加删除分类，添加任务，修改任务，以及给任务标记是否完成等功能<br/>清除按钮可以清除本地缓存"
			
		}];
		
		localStorage.cate = JSON.stringify(cateText);
		localStorage.childCate = JSON.stringify(childCateText);
		localStorage.task = JSON.stringify(taskText);
		
	}
	
}


/*关于左边分类的*/

function initCates(){
	
	var cate = queryAllCates();//获取所有的主分类
	var childCate = queryAllChildCates();
	
	var oldChoose = document.querySelector(".list .choose");//保存选中的分类选项；刷新之后记住以免刷新之后改变choose的元素
	
	//console.log(oldChoose);
	
	document.querySelector("#li").innerHTML = '<h2><i class="icon-folder-open"></i><span>所有任务</span>('
											+getAllUnfinishTaskNum()+')</h2>';//给所有任务加上innerhtml
	
	var html = '';
	
	for(var i=0, l= cate.length; i<l;i++){
		
		if(cate[i].child.length == 0){//如果主分类下面没有子分类
			
			html+=''
				+'<li>'
				+'<h3 cateid='+ cate[i].id +'><i class="icon-folder-open-empty"></i><span>'+ cate[i].name
				+'</span>(0)<i class="delete  icon-minus-circled"></i></h3>'
				+'</li>';
		
		}else{
			if(i==0){//如果是默认主分类
				
				html+='<li>'
					+	'<h3 cateid=0><i class="icon-folder-open-empty"></i><span>默认分类</span>(0)</h3>'
					+		'<ul class="item">'
					+			'<li>'
					+				'<h4 childcateid=0><i class="icon-doc-text"></i><span>默认子分类</span>(0)</h4>'
					+			'</li>'
					+		'</ul>'
					+ '</li>';
				
				
			}else{
				
				html+='<li>'
					+	'<h3 cateid='+cate[i].id+'><i class="icon-folder-open-empty"></i>'
					+	'<span>'+ cate[i].name+'</span>('+getCateUnfinishTaskNum(cate[i])+')'
					+   '<i class="delete  icon-minus-circled"></i></h3>'
					+'<ul>';
				
				for(var j=0,c=cate[i].child.length;j<c;j++){
					
					var childCateId=cate[i].child[j];
					var childCateObj=queryChildCatesById(childCateId);
					
					html+=''
						+'<li>'
						+'<h4 childcateid ='+childCateId+'><i class="icon-doc-text"></i>'
						+'<span>'+childCateObj.name+'</span>('+getChildUnfinishTaskNum(childCateObj)+')<i class="delete  icon-minus-circled"></i></h4>'
						+'</li>'
				}
				
				html+='</ul></li>'
			}
			
		}	
	}
	
	document.querySelector('#list-item').innerHTML=html;
	
	
	/*处理之前选中的选项*/
	if(oldChoose){
		var tag = oldChoose.tagName.toLowerCase();//获取有choose类名的元素tagName是h2 h3 h4
		var name = oldChoose.getElementsByTagName('span')[0].innerHTML;//获取有choose类名的主分类或者子分类的名称
		
		var isClick =false;
		switch(tag){
		
			case 'h2'://代表是所有任务
			document.querySelector("#li h2").className='choose';
			isClick = true;
			break;
			
			case 'h3'://代表是主分类
			var cateEle=document.getElementsByTagName('h3');
			for (var i=0,l=cateEle.length;i<l;i++) {
				
				if(cateEle[i].getElementsByTagName('span')[0].innerHTML===name){
					cateEle[i].className='choose';
					isClick = true;
					break;
				}
				
			}
			break;
			
			case 'h4'://代表是子分类
			var childEle=document.getElementsByTagName('h4');
				for(var i=0,l=childEle.length;i<l;i++)
				{
					if(childEle[i].getElementsByTagName('span')[0].innerHTML===name)
					{
						childEle[i].className='choose';
						isClick=true;
						break;
					}
				}
			break;
		}
		
		if(!isClick){
			document.querySelector("#li h2").className='choose';//#li
		}
		
	}else{
		document.querySelector("#li h2").className='choose';//默认选中所有任务
	}
	
	//补充初始化任务列表函数
	initTasks();
}






/*获取所有的主分类*/
function queryAllCates()
{
	return JSON.parse(localStorage.cate);
}


/*获取所有子分类*/
function queryAllChildCates(){
	return JSON.parse(localStorage.childCate);
}

/*获取所有任务*/

function queryAllTasks(){
	return JSON.parse(localStorage.task);
}

/*根据taskid获取task对象*/

function queryTaskById(taskid){
	
	var task = queryAllTasks();
	
	for(var i=0, l=task.length;i<l;i++){
		
		if(task[i].id == taskid){
			return task[i];
		}
	}
	
}


/*通过主分类id获取主分类对象 cateid*/

function queryCateById(cateid){
	
	var cate = queryAllCates();
	
	for(var i=0, l=cate.length;i<l;i++){
		
		if(cate[i].id == cateid){
			return cate[i];
		}
	}
	
}


/*通过子分类id查找子分类*/

function queryChildCatesById(ChildCateId){
	
	var childCate = queryAllChildCates();
	
	for(var i=0, l=childCate.length;i<l;i++){
		
		if(childCate[i].id == ChildCateId){
			return childCate[i];
		}
	}
	
}


/*获取所有未完成任务的数量*/

function getAllUnfinishTaskNum(){
	
	var rel = 0;
	
	var task = queryAllTasks();//获取所有的任务数组
	
	for(var i=0, l= task.length;i<l;i++){
		
		if(task[i].finish==false)
		{
			rel++;
		}
	}
	return rel;	
}


/*获取子分类中未完成的任务数目，传入参数是子分类对象，返回参数是子分类下未完成任务的数量*/

function getChildCateUnfinishTaskNum(childCateObject){
	
	var num = 0;
	
	if(childCateObject.child.length!==0)
	{
		for(var i=0,l=childCateObject.child.length;i<l;i++)
		{
			var taskItem=queryTaskById(childCateObject.child[i]);
			if(taskItem.finish==false)
			{
				num++;
			}
		}
	}
	return num;
	
}


/*获取主分类下未完成的任务数目*/

function getCateUnfinishTaskNum(cateobj){
	
	var res =0;
	
	if(cateobj.child.length != 0){//这里的！==
		
		for(var i=0, l= cateobj.child.length; i<l; i++){
			
			var currentChild = queryChildCatesById(cateobj.child[i]);//获取主分类下的子分类
			
			if(currentChild.child.length != 0){//这里的！==
				
				for(var j=0,c=currentChild.child.length;j<c;j++)
				{
					var currentTask=queryTaskById(currentChild.child[j]);//获取子分类下的task
					if(currentTask.finish==false)
					{
						res++;
					}
				}
			}
			
		}
		
	}
	return res;
}


/*获取子分类中的未完成任务数目*/

function getChildUnfinishTaskNum(childobj){
	
	var res = 0;
	
	if(childobj.child.length !==0){//这里的！==
		
		for(var i=0,l=childobj.child.length; i<l; i++){
			
			var currentTask = queryTaskById(childobj.child[i]);//获取主分类下的子分类
			
			if(currentTask.finish == false){
				
				res++;
			}
		}
		
	}

	return res;
}

/*根据对象obj的属性key如果等于value那么返回这个对象*/

function getObjByKey(obj,key,value){
	
	for(var i=0,l=obj.length;i<l;i++){
		
		if(obj[i][key]===value){
			
			return obj[i];
		}
	}
}




















/*AllCateClick,分类列表中的点击所有任务处理函数*/

function AllCateClick(event){
	
	event = EventUtil.getEvent(event);//获取事件 兼容浏览器
	
	var target = EventUtil.getTarget(event);//获取事件目标
	
	//console.log(target);
	
	setCateHighLight(target);//高亮设置
	
	statusAll();//将type中间部分显示为所有
	
	initTasks();//补充中间列表的函数
}

/*点击主分类的事件处理函数*/

function cateClick(target){
	
	statusAll();//更改type的status为所有
	setCateHighLight(target);//高亮
	initTasks();//补充中间列表的函数
}


function childCateClick(target){
	
	statusAll();//更改type的status为所有
	setCateHighLight(target);//高亮
	
	initTasks();//补充中间列表的函数
}





/*设置高亮部分*/
function setCateHighLight(element){
	
	clearAllCateHighLight();//清除所有高亮
	
	if(element.tagName.toLowerCase() == 'h2' || element.tagName.toLowerCase() == 'h3' || element.tagName.toLowerCase() == 'h4'){
		element.className='choose';
	}else if(element.parentNode.tagName.toLowerCase()=='h2' || element.parentNode.tagName.toLowerCase()=='h3' || element.parentNode.tagName.toLowerCase()=='h4'){
		element.parentNode.className='choose';
	}
	
}

function setTaskHightLight(element){
	
	clearAlltaskHightLight();//清除中间子分类的高亮
	
	if(element.tagName.toLowerCase() == 'h6'){
		element.className = 'choose';
	}else if(element.parentNode.tagName.toLowerCase() == 'h6'){
		element.parentNode.className = 'choose';
	}
	
	
}


/*清除高亮*/

/*清除分类列表中所有高亮*/

function clearAllCateHighLight(){
	
	//将所有任务的高亮去掉	
	document.querySelector("h2").className='';
	document.querySelector("#li").className='';
	var h3Elements = document.querySelector('#list-item').getElementsByTagName('h3');//获取所有主分类的元素
	for(var i=0,l=h3Elements.length; i<l;i++){
		
		h3Elements[i].className='';
	}
	
	var h4Elements = document.querySelector('#list-item').getElementsByTagName('h4');//获取所有子分类的元素
	for(var j=0,l=h4Elements.length; j<l;j++){
		
		h4Elements[j].className='';
	}
}



/*清除中间的子列表高亮*/

function clearAlltaskHightLight(){
	
	var h6Elements = document.querySelector('#type-list').getElementsByTagName('h6');//获取中间的元素名
	for(i=0,l=h6Elements.length; i<l; i++){
		
		h6Elements[i].className='';
	}
	
}




/*将status的choose始终更改到所有上去*/

function statusAll(){
	
	//清除原来的choose
	var statusLi = document.querySelectorAll('#status li');
	for(var i=0,l=statusLi.length; i<l; i++){
		statusLi[i].className='';
	}
	//选中所有
	document.querySelector('#type-all').className = 'choose';
}



/*add 新增按钮*/
/****************************************************要修改啊！！！！！*/
function clickAddCate(){
	
	document.querySelector('#add-window').style.display="block";
	
	taskEditHide();
	
	var addStr = '<select class="add-wrap-select" id="addCate">'
				+'<option value = "-1">新增主分类</option>';
	
	var optionStr = '';
	
	var cate = queryAllCates();
	
	for(var i=0, l=cate.length; i<l; i++){
		
		optionStr = '<option value="'+cate[i].id+'">'+cate[i].name+'</option>';
		addStr += optionStr;
	}
	
	addStr += '</select>';
	
	document.querySelector('#add-new-textname').value="";
	document.querySelector('#addCate').innerHTML = addStr;
	
	
}


/* 新增分类*/
function cateAdd(){
	
	var childCate=queryAllChildCates();
	var cate=queryAllCates();
	var cateName=document.querySelector("#add-new-textname").value;//获取增加分类的名称
	var selectVal=document.querySelector("#addCate").value;//获取下拉菜单中选中项的id
	
	console.log(selectVal);
	console.log(cate);
	if(cateName.length===0){
		
		alert("分类名称不能为空");
		
	}else if(cateName.length>10){
		
		alert("分类名称不能多于10个字符");
		
	}else if(getObjByKey(cate,'name',cateName)){
		
		alert("已经有相同的主分类名称");
		
	}else if(getObjByKey(childCate,'name',cateName)){
		
		alert("已经有相同的子分类名称");
		
	}else if(selectVal=== '-1'){//代表是需要增加主分类
	
		var newCate={
			'id':cate[cate.length-1].id+1,
			'name':cateName,
			'child':[]
		};
		cate.push(newCate);
		localStorage.cate=JSON.stringify(cate);
		
	}else if(selectVal==='0'){//如果是默认分类不允许添加子分类
	
		alert("不允许为默认主分类添加子分类");
	
	}else {//代表是需要增加子分类
		
		console.log(selectVal);
		//var index=getIndexByKey(cate,"id",selectVal);//获取cate中id值为selectVal的index值
		var curCate=queryCateById(selectVal);
		
		console.log(curCate);
		//console.log(index);
		var newChildCate={
			'id':childCate[childCate.length-1].id+1,
			'name':cateName,
			'child':[],
			'pid':curCate.id
		}
		//var parentCate=getObjByKey(cate,'id',newChildCate.pid);//找到对应的父节点即主分类对象
		curCate.child.push(newChildCate.id);//更改父节点的child数组中的值
		childCate.push(newChildCate);//更改子分类数组

		for(var i=0,l=cate.length;i<l;i++){
		
			if(cate[i].id===curCate.id){
			
				cate[i]=curCate;
				break;
			}
		}

		localStorage.cate=JSON.stringify(cate);
		localStorage.childCate=JSON.stringify(childCate);
		//console.log(cate);
	}
	initCates();//初始化左边
	coverHide();
	
	
}


/*点击cover中的取消按钮*/
function coverHide(){

	document.querySelector("#add-window").style.display="none";
}


/*删除分类函数*/

function deleteCate(event){
	console.log(event);
	window.event ? window.event.cancelBubble=true : event.stopPropagation();//阻止事件冒泡
	var rel=confirm("确定要删除么");
	if(rel)
	{
		event=EventUtil.getEvent(event);//获取事件 兼容浏览器

		var target=EventUtil.getTarget(event);//获取事件目标
		var ele=target.parentNode;
		//var tag=ele.tagName.toLowerCase();//h4 

		var name=ele.getElementsByTagName("span")[0].innerHTML;//获取点击的子分类或者主分类的名称

		//console.log("delte cate click");
		//console.log(ele);
		//console.log(name);
		var cate=queryAllCates();
		var childCate=queryAllChildCates();

		var cateId=ele.getAttribute('cateid');//获取主分类的id
		var cateObj=queryCateById(cateId);//获取主分类的对象
		//console.log(cateObj);

		if(cateObj.child.length!=0){//如果下面有子分类
		
			for(var i=0,l=cateObj.child.length;i<l;i++){
			
				var childId=cateObj.child[i];
				var childObj=queryChildCatesById(childId);
				
				if(childObj.child.length !=0){
				
					//删除任务列表
					//console.log("l j  m  ");
					var tasks=queryAllTasks();
					for(var j=0,c=childObj.child.length;j<c;j++){
					
						var taskObj=queryTaskById(childObj.child[j]);
						var index=getIndexByKey(tasks,'name',taskObj.name);//找到要删除的task对象在task数组中的下标
						tasks.splice(index,1);
					}
					localStorage.task=JSON.stringify(tasks);//保存task数组
				}
				//获取子分类对象在子分类数组中的index然后删除该数组中的index项
				var index=getIndexByKey(childCate,'name',childObj.name);
				//var index=childCate.indexOf(childObj);
				//console.log(childCate);
				//console.log(childObj);
				//console.log(index);
				childCate.splice(index,1);
			}
		}
		var cateIndex=getIndexByKey(cate,'name',cateObj.name);
		//var cateIndex=cate.indexOf(cateObj);
		cate.splice(cateIndex,1);
		localStorage.cate=JSON.stringify(cate);
		localStorage.childCate=JSON.stringify(childCate);

		initCates();
	}

}


/*根据某对象的某属性得到某对象的序号*/


function getIndexByKey(obj,key,value){
	
	for(var i=0,l=obj.length;i<l;i++){
		if(obj[i][key] === value){
			
			return i;
		}
	}
	
}


/*删除子分类事件*/

function deleteChildCate(event){

	window.event ? window.event.cancelBubble=true : event.stopPropagation();//阻止事件冒泡
	var rel=confirm("确定要删除么");
	if(rel){
	
		event=EventUtil.getEvent(event);//获取事件 兼容浏览器

		var target=EventUtil.getTarget(event);//获取事件目标
		var ele=target.parentNode;
		var tag=ele.tagName.toLowerCase();//h4 

		var name=ele.getElementsByTagName("span")[0].innerHTML;//获取点击的子分类或者主分类的名称

		//console.log(name);
		var cate=queryAllCates();
		var childCate=queryAllChildCates();

		var childId=ele.getAttribute('childcateid');//获取子分类的id
		var childObj=queryChildCatesById(childId);//获取子分类的对象
		var name=childObj.name;
		console.log(childObj);
		console.log(childCate);
		console.log(name);
		console.log(childObj.child.length);
		if(childObj.child.length !=0){
		console.log('111');
			//删除任务列表
			var tasks=queryAllTasks();
			for(var j=0,c=childObj.child.length;j<c;j++){
			
				var taskObj=queryTaskById(childObj.child[j]);
				var index=getIndexByKey(tasks,'name',taskObj.name);//找到要删除的task对象在task数组中的下标
				
				tasks.splice(index,1);
			}
			localStorage.task=JSON.stringify(tasks);//保存task数组
		}
		console.log('name');
		//获取子分类对象在子分类数组中的index然后删除该数组中的index项
		var index=getIndexByKey(childCate,'name',name);
		
		//console.log(index);
		childCate.splice(index,1);
		
		//console.log(childCate);
		//更新主分类的child数组
		var currentCate=queryCateById(childObj.pid);//子分类所在的主分类对象
		
		currentCate.child.splice(currentCate.child.indexOf(parseInt(childId)),1);//这个地方要注意了 childId是字符串，要更改为int型 否则结果错误
		
		for(var i=0,l=cate.length;i<l;i++){
		
			if(cate[i].id==childObj.pid){
			
				cate[i]=currentCate;
				
				break;
			}
		}
		//console.log(currentCate);
		//console.log(cate);
		localStorage.cate=JSON.stringify(cate);
		localStorage.childCate=JSON.stringify(childCate);

		initCates();
	}
}









/*添加新任务*/

function clickAddTask(){
	
	var oldChoose=document.querySelector('.list .choose');
	var tag=oldChoose.tagName.toLowerCase();
	if(tag=='h4' && oldChoose.getAttribute('childcateid')==0){//说明选中的是子分类
		
		alert('默认子分类不允许添加任务');
	}else if(tag=='h4'){//说明选中的是子分类
		
		//console.log(oldChoose.getAttribute('childcateid')==1);
		//隐藏display界面
		a = document.querySelectorAll(".cont span");
		
		for(var i=0,l=a.length; i<l; i++){
		a[i].style.display='none';
		}
		
		//显示edit界面
		b = document.querySelectorAll('.cont input,#cont-text');
		
		for(var i=0,l=b.length; i<l; i++){
		b[i].style.display='inline';
		}
		
		
		//将右侧新建任务时的界面的保存按钮的id更改为save
		document.querySelector('#saveOrCancel').querySelector('button').id='save';
		
	}else{
		alert('请先建立子分类再添加任务');
	}
	
}






/*符合添加任务的条件 添加任务函数*/

function taskAdd(childId){
	
	var inTitle=document.querySelector("#cont-title").value;
	var inDate=document.querySelector("#cont-date").value;
	var inContent=document.querySelector("#cont-text textarea").value;
	var childObj=queryChildCatesById(childId);//获取子分类对象
	var task=queryAllTasks();
	var childCate=queryAllChildCates();
	var taskobj={};
	taskobj.id=task[task.length-1].id+1;//id等于最后一个task的id加上1
	taskobj.pid=childId;
	taskobj.name=inTitle;
	taskobj.finish=false;
	taskobj.date=inDate;
	taskobj.content=inContent;
	
	//向task的数组中加入taskobj
	task.push(taskobj);
	localStorage.task=JSON.stringify(task);
	//改变childid的child中的数组值
	childObj.child.push(taskobj.id);
	for(var i=0,l=childCate.length;i<l;i++){
		if(childCate[i].id==childId){
			childCate[i]=childObj;
			break;
		}
	}
	
	localStorage.childCate = JSON.stringify(childCate);
	
	console.log(childCate);
	
//	//隐藏编辑界面
//	document.querySelector(".cont input,#cont-text").style.display="none";
//	//显示display界面并且display界面显示刚刚添加的任务
//	document.querySelector('.cont span').style.display="inline";
//	
//	
	/*编辑上边的问题*/
	
	a = document.querySelectorAll('.cont span');
	for (var i = 0; i < a.length; i++) {
		a[i].style.display='inline';
	}
			
	b = document.querySelectorAll('.cont input,#cont-text');
	for (var i = 0; i < b.length; i++) {
		b[i].style.display='none';
	}
	
	
	
	statusAll();//刷新task任务列表和分类列表	
	initCates();//经过初始化后选中的任务是任务列表中的第一个任务
	
	
	//document.querySelectorAll("h6")[0].className="";//将任务列表中的第一个任务的choose取消掉
	var h6Elements=document.getElementsByTagName('h6');
	for(var i=0,l=h6Elements.length;i<l;i++){
		var span=h6Elements[i].getElementsByTagName('span')[0].innerHTML;//获取h6元素的名称即任务名称
		//console.log(span);
		
		clearAlltaskHightLight();
		if(span==inTitle){
			
			h6Elements[i].className='choose';//为刚才新建的任务添加上choose
			break;
			
		}
	}
	document.querySelector("#cont-title").value="";
	document.querySelector("#cont-date").value="";
	document.querySelector("#cont-text textarea").value="";
	taskDisplay();
	
}








/* 中间最上边部分选择*/
function statusClick(target){
	
	var statusid = target.id;
	console.log(statusid);
	//先清除原来的choose
	
	var statusLi = document.querySelectorAll('#status li');
	
	for(i=0, l=statusLi.length; i<l; i++){
		
		statusLi[i].className='';
		
	}
	
	if(target.tagName.toLowerCase() == 'li'){
		
		target.className = 'choose';
	}else if(target.parentNode.tagName.toLowerCase() == 'li'){
		target.parentNode.className = 'choose';
	}
	
	if(statusid == 'type-all'){
		initTasks();
	}else if(statusid == 'type-unfinished'){
		initTasks(false);
	}else if(statusid == 'type-finished'){
		initTasks(true);
	}
	
}


/*删除任务函数*/

function deleteTask(target){
	
	console.log(target);
	
	var h6task =target.parentNode;
	
	console.log(h6task);
	
	var taskid = h6task.getAttribute('taskid');
	
	taskid = parseInt(taskid);
	console.log(taskid);
	
	if(taskid !==0){//如果不是使用说明这个任务
		
		var taskobj=queryTaskById(parseInt(taskid));
		var tasks=queryAllTasks();
		var childCate=queryAllChildCates();
		console.log(taskobj);
		
		//获取任务对象在任务数组中的index然后删除该数组中的index项
		//var index=tasks.indexOf(taskobj);
		var index=getIndexByKey(tasks,'name',taskobj.name);
		//console.log(index);
		tasks.splice(index,1);
		localStorage.task=JSON.stringify(tasks);

		//更改task对应的子分类的child数组
		var childcateid=taskobj.pid;
		//console.log(childcateid);
		var childcateobj=queryChildCatesById(childcateid);
		//console.log(childcateobj);
		var childchild=childcateobj.child;
		var childindex=childchild.indexOf(parseInt(taskid));
		//console.log(childindex);
		childcateobj.child.splice(childindex,1);
		//console.log(childchild);
		
		for (var i=0,l=childCate.length;i<l;i++) {
			
			if(childCate[i].id==childcateid){
				childCate[i] = childcateobj;
				break;//return
			}
			
		}
		
		localStorage.childCate = JSON.stringify(childCate);
		
		statusAll();
		//初始化左边和中间
		initCates();
		
		
	}
	
}


/*右侧展示任务界面的初始化*/

function taskDisplay(){
	
	//获取选择的是哪个任务
	var ele=document.querySelector('#type-list .choose');
	//console.log(ele);
	if(ele){//判断ele是否存在  有可能没有任务 那么下面就会报错 所以要判断
		
		var taskid=ele.getAttribute('taskid');
		console.log(taskid);
		var taskobj=queryTaskById(parseInt(taskid));
		console.log(taskobj);
		document.querySelector("#disTitle").innerHTML=taskobj.name;
		document.querySelector("#disDate").innerHTML=taskobj.date;
		document.querySelector("#disContent").innerHTML=taskobj.content;
		
		if(taskobj.finish == true){
			
			document.querySelector('.set').style.display='none';
			
		}else{
			document.querySelector('.set').style.display='block';
		}
		
	}
}

/*点击标记完成*/

function taskEditFinish(){
	
	var tasks=queryAllTasks();
	var ele=document.querySelector('h6.choose');
	//console.log(ele);
	var taskid=ele.getAttribute('taskid');
	var taskobj=queryTaskById(parseInt(taskid));
	
	taskobj.finish = true;
	//console.log(taskobj);
	
	for(var i=0,l=tasks.length;i<l;i++){
		if(tasks[i].id==taskid){
			
			tasks[i]=taskobj;
			break;
			
		}
	}
	
	localStorage.task = JSON.stringify(tasks);
	
	statusAll();//将status恢复到所有上去
	initCates();
	
}


/*编辑任务*/

function taskEdit(){
	
	var tasks=queryAllTasks();
	var ele=document.querySelector('h6.choose');
	
	//console.log(ele);
	var taskid=ele.getAttribute('taskid');
	var taskobj=queryTaskById(parseInt(taskid));
	//console.log(taskobj);
	
	
	taskobj.name=document.querySelector('#cont-title').value;
	taskobj.date=document.querySelector('#cont-date').value;
	taskobj.content=document.querySelector('#cont-text').value;
	var a=0;
	
	for(var i=0,l=tasks.length;i<l;i++){
		
		if(tasks[i].name==taskobj.name){
			a++;
		}
		
	}
	
	console.log(a);
	if(a===1 || a===0){
		
		for(var i=0,l=tasks.length;i<l;i++){
			
			if(tasks[i].id==taskid){
				tasks[i]=taskobj;
				break;
			}
		}
		localStorage.task=JSON.stringify(tasks);
		statusAll();//将status标记为所有
		taskEditHide();//隐藏编辑界面 显示展示界面
		initCates();
		
	}else{
		alert('标题重复')
	}
	
	
}











/*任务列表初始化*/
// //初始化任务列表中传入一个参数这个参数是任务数组代表的含义是在三个不同状态下
// //应该对应的任务数组，免得用初始化任务列表的函数不同
// function getRelTaskArr()
// {

// }


function taskEditHide(){
	
	document.querySelector('#cont-title').value="";
	document.querySelector('#cont-date').value="";
	document.querySelector('#cont-text .text').value="";
	
//	/*隐藏右侧的编辑窗口*/
//	document.querySelector('.cont input,#cont-text').style.display="none";
//	document.querySelector('.cont span').style.display="inline";
	
	
	
			
	b = document.querySelectorAll('.cont input,#cont-text');
	for (var i = 0; i < b.length; i++) {
		b[i].style.display='none';
	}
	
	a = document.querySelectorAll('.cont span');
	for (var i = 0; i < a.length; i++) {
		a[i].style.display='inline';
	}
	
	
}


function initTasks(status){
	//console.log(status);
	var oldChoose = document.querySelector("#type-list .choose");//保存选中的分类选项；刷新之后记住以免刷新之后改变choose的元素
	//console.log(oldChoose);
	var date=[];//日期数组
	
	if(status == false){
		var taskAll = queryTaskByStatus(false);//去除未完成的数组
	}else if(status == true){
		var taskAll = queryTaskByStatus(true);//取出已完成的任务数组
	}else{
		var taskAll = queryAllTaskArr();//这是点击中间所有的时候对应的任务列表
		
	}
	
	//取出所有不重复日期
	//console.log(taskAll);
	for(var i=0, l = taskAll.length; i<l; i++){
		
		
		//console.log(date.indexOf(taskAll[i].date));
		if(date.indexOf(taskAll[i].date) < 0){//代表date数组中还没有这个日期存在
			date.push(taskAll[i].date);
		}
	}
	
	
	//对日期进行排序
	//console.log(date);
	date = date.sort(compare);
	var taskDateArr = [];
	
	
	//根据日期增加其中每个日期下面对应的任务的Id的数组
	//结构类似：[ {'date':date,taskId:[taskobj1,taskobj2]},{'date':date,taskId:[taskobj3,taskobj4]} ]
	
	for(var i=0,l=date.length; i<l; i++){
		
		var dateObj = {
			'date':date[i],
			'tasks':[]
		};
		
		for(var j=0,c=taskAll.length; j<c; j++){
			
			if(date[i] == taskAll[j].date){//如果task中的日期与date数组中日期相同
				
				dateObj.tasks.push(taskAll[j]);
			}
		}
		
		taskDateArr.push(dateObj);
		
	}
	
	/*下面是中间任务列表的html*/
	
	var ulStr='';
	//console.log(date);
	for(var i=0,l=date.length;i<l;i++){
	
		ulStr+='<li><h5>'+taskDateArr[i].date+'</h5><ul>';
		for(var j=0,c=taskDateArr[i].tasks.length;j<c;j++){
		
			var taskObject=taskDateArr[i].tasks[j];
			
			//console.log(taskObject);
			if(taskObject.finish==true){
			
				ulStr+='<li class="type-finish"><h6 taskid="'+taskObject.id+'">'
					+ '<i class="icon-ok-squared"></i><span>'+taskObject.name+'</span><i class="delete  icon-minus-circled"></i></h6></li>';
			}else{
			
			
				ulStr+='<li><h6 taskid="'+taskObject.id+'"><span>'
					+ taskObject.name+'</span><i class="delete  icon-minus-circled"></i></h6></li>';
			}
		}
		ulStr+='</ul></li>'
	}
	console.log(ulStr);
	document.querySelector("#type-list").innerHTML=ulStr;

	if(oldChoose)
	{
		var eleTag=oldChoose.tagName.toLowerCase();//获取元素标签h6
		var name=oldChoose.getElementsByTagName('span')[0].innerHTML;//获取task的名称
		var chooseid=oldChoose.getAttribute('taskid');
		//console.log(name);

		var isClick=false;

		var taskEle=document.getElementsByTagName('h6');
		
		for(var i=0,l=taskEle.length;i<l;i++){
		
			//console.log(taskEle[i].getElementsByTagName('span')[0].innerHTML);
			if(taskEle[i].getAttribute('taskid')==chooseid){
			
				taskEle[i].className="choose";//给li元素添加choose样式
				isClick=true;
				break;
			}
		}if(!isClick){
		
		
			//console.log(document.querySelector("h6"));
			if(document.querySelector("h6")){
				//这里这句if的作用是如果所有的任务都删除了 那么就会报错 所以要保证有任务的时候才能给其添加className
			
				document.querySelector("h6").className="choose";
			}
		}
	}else{
	
	
		if(document.querySelector("h6")){
			
				document.querySelector("h6").className="choose";
			}
	}

	//在右侧界面显示任务详情
	taskDisplay();
	
	
	
	
	
	
	
	
}




/*获取左边被选中选项中所有的task*/

function queryAllTaskArr(){
	
	var chooseCate = document.querySelector(".list .choose");//获取左边选中元素
	
	//console.log(chooseCate);
	
	var currentTaskArr =[];
	/*这个地方可能需要我回来修改*/
	if(chooseCate.tagName.toLowerCase() == 'h2'){//选中是所有任务
		//alert(123);
		currentTaskArr = queryAllTasks();// 获取所有的任务数组
	}else if(chooseCate.tagName.toLowerCase() == 'h3'){//主分类
		
		var cateId = chooseCate.getAttribute('cateid');//
		var cateObj = queryCateById(cateId);//获取主分类对象
		
		//console.log(cateObj.child.length);
		
		for(var i=0,l=cateObj.child.length; i<l;i++){
			
			var childObj=queryChildCatesById(cateObj.child[i]);//获取子分类对象
			
			for(var j=0,c=childObj.child.length;j<c;j++){
				var taskObj=queryTaskById(childObj.child[j]);
				currentTaskArr.push(taskObj);
			}
		}
		
		
	}else if(chooseCate.tagName.toLowerCase()=='h4'){//子分类
		
		var childId = chooseCate.getAttribute('childcateid');//获取子分类的id
		//console.log(childId);
		var childObj = queryChildCatesById(childId);
		
		for(var i=0,l=childObj.child.length;i<l;i++){
			
			var taskObj=queryTaskById(childObj.child[i]);
			currentTaskArr.push(taskObj);
			
		}
	}
	console.log(currentTaskArr);
	return currentTaskArr;
}


/*根据状态产生对应的任务数组*/

function queryTaskByStatus(status){
	
	var taskArr = queryAllTaskArr();//获取当前的所有任务数组
	
	var statusTaskArr = [];
	
	for(var i=0, l= taskArr.length; i<l; i++){
		
		if(status == true){
			if(taskArr[i].finish == true){
				statusTaskArr.push(taskArr[i]);
			}
		}else {
			if(taskArr[i].finish == false){
				statusTaskArr.push(taskArr[i]);
			}
		}
	}
	
	return statusTaskArr;
}


/*数组排序比较函数sort函数
调用方式：array.sort(compare);*/

function compare(value1,value2){
	
	if(value1<value2){
		return -1;
	}else if(value1>value2){
		return 1;
	}else{
		return 0;
	}
	
}



























