class BrakeBanner{
	constructor(selector){
		// 1.创建画布
		this.app = new PIXI.Application({
			with:window.innerWidth,
			height:window.innerHeight,
			backgroundColor:0xffffff,
			resizeTo:window, // 画布跟着窗口变大 缩小
		})
		document.querySelector(selector).appendChild(this.app.view)
		this.stage = this.app.stage
		//2. 加载图片资源 
		this.loader = new PIXI.Loader()
		let imageList = ['btn.png','brake_bike.png','brake_handlerbar.png','brake_lever.png','btn_circle.png']
		imageList.forEach(imageName=>this.helpLoadImage({imageName}))
		this.loader.load()
		// 3. 将图片添加到场景上，并展示
		this.loader.onComplete.add(()=>{
			this.show()
		})
	}
	/**
	 * 主逻辑
	 * 1. 创建 按钮 并做动效
	 * 2. 创建车身和把手
	 * 3. 创建粒子效果
	 */
	show(){
		// 1.创建 “按住” 的按钮
		let actionButton = this.createActionButton()
		// 1.1 添加交互事件：mousedown 鼠标点击事件
		actionButton.on('mousedown',()=>{
			// 按下刹车的动效
			gsap.to(bikeLeverImge,{duration:.6,rotation:Math.PI/180*-30})
			// 粒子效果停止
			pause()
		})
		// 1.2 mouseup 鼠标释放
		actionButton.on('mouseup',()=>{
			// 刹车恢复原位的动效
			gsap.to(bikeLeverImge,{duration:.6,rotation:0})
			// 粒子效果开始
			start()
		})
		// 2.创建车身的容器和车身
		 let {bikeContainer,bikeLeverImge} = this.createBikeContainer()
		// 注意：addChild 有先后顺序，先addChild 的 图层在下面
		this.stage.addChild(bikeContainer)
		this.stage.addChild(actionButton)
		// 3. 创建粒子
		let {particleContainer,start,pause} = this.createParticleContainer()
		this.stage.addChild(particleContainer)
		// 初始的时候：默认开启粒子效果
		start()

		// 做个窗口适配：车身和按钮都固定在右下角
		let resize = ()=>{
			bikeContainer.x = window.innerWidth - bikeContainer.width
			bikeContainer.y = window.innerHeight - bikeContainer.height

			actionButton.x = window.innerWidth - bikeContainer.width + 300
			actionButton.y = window.innerHeight - bikeContainer.height + 300
		}
		window.addEventListener('resize',resize)
		resize()
	}
	/**
	 * 创建 “按住” 的 按钮
	 * 
	 */
	createActionButton(){
		// 4. 按住的动效【场景 和 容器的 使用】
		// 容器可以理解为 div 场景只有一个 理解为body
		// pivot 圆心的点
		let actionButton = new PIXI.Container()
		let btnImage = this.helpGetSprite({key:'btn.png'})
		let btnCircle = this.helpGetSprite({key:'btn_circle.png'})
		let btnCircle2 = this.helpGetSprite({key:'btn_circle.png'})
		actionButton.addChild(btnImage)
		actionButton.addChild(btnCircle)
		actionButton.addChild(btnCircle2)
		// 5.修改 坐标
		btnCircle.pivot.x = btnCircle.pivot.y = (btnCircle.width/2)
		btnCircle2.pivot.x = btnCircle2.pivot.y = (btnCircle2.width/2)
		btnImage.pivot.x = btnImage.pivot.y = (btnImage.width/2)
		
		// to 到达某个动作；duration 时长 x y 变成什么样子 repeat 循环
		btnCircle.scale.x = btnCircle.scale.y = 0.8
		gsap.to(btnCircle.scale,{duration:1,x:1.3,y:1.3,repeat:-1})
		gsap.to(btnCircle,{duration:1,alpha:0,repeat:-1})

		// 配置可以交互
		actionButton.interactive = true
		actionButton.buttonMode = true

		return actionButton
	}
	/**
	 * 创建车身和把手的容器
	 */
	 createBikeContainer(){
		// 自行车整体的容器；你可以理解为一个大的容器
		let bikeContainer = new PIXI.Container()
		bikeContainer.scale.x = bikeContainer.scale.y = 0.3
		// 自行车最下面的轮子+车身的图片=>在图层的最下面，所以先 addChild
		let bikeImge = this.helpGetSprite({key:'brake_bike.png'})
		bikeContainer.addChild(bikeImge)
		// 自行车 按刹车的把柄 
		let bikeLeverImge = this.helpGetSprite({key:'brake_lever.png'})
		bikeContainer.addChild(bikeLeverImge)
		bikeLeverImge.pivot.x = 455;
		bikeLeverImge.pivot.y = 455;
		bikeLeverImge.x = 722;
		bikeLeverImge.y = 900;
		// 自行车的龙头
		let bikeHandlerbarImge = this.helpGetSprite({key:'brake_handlerbar.png'})
		bikeContainer.addChild(bikeHandlerbarImge)
		return {bikeContainer,bikeLeverImge}
	}
	/**
	 * 创建粒子 和 粒子容器的设置
	 */
	 createParticleContainer(){
		// 创建粒子的容器
		let particleContainer = new PIXI.Container()
		// NOTE:重点：将容器旋转一定的角度；那么里面的粒子就不需要 计算按照一定的角度 下降，只需要沿着 Y 轴运动即可
		particleContainer.pivot.x = window.innerWidth/2
		particleContainer.pivot.y = window.innerHeight/2
		particleContainer.x = window.innerWidth/2
		particleContainer.y = window.innerHeight/2
		// 旋转容器
		particleContainer.rotation = 35 * Math.PI/180
		
		let particles = []
		let colors = [0xf1cf54,	0xb5cea8,0xf1cf54,0x818181,0x0000]
		for(let i=0;i<10;i++){
			// 循环创建粒子：颜色随机
			let gr =new PIXI.Graphics()
			gr.beginFill(colors[Math.floor(Math.random()*colors.length)])
			gr.drawCircle(0,0,6)
			gr.endFill()
			// 保存每个创建出来的粒子实例 并记录 他初始的 xy 坐标位置：主要是为了 停下来的时候，全部都要复位
			let pItem = {
				sx:Math.random() * window.innerWidth,
				sy:Math.random() * window.innerHeight,
				gr
			}
			gr.x = pItem.sx
			gr.y = pItem.sy
			particleContainer.addChild(gr)
			particles.push(pItem)
		}
		let speed = 0
		/**
		 * 循环函数：
		 * 1. 初始速度为了 0 ，每次速度增加 .5;但是最高速度为 20
		 * 2. 每次循环 每个粒子的 Y 轴都会 往下移动，移动的量为 当前Y值+当前速度；
		 * 3. 每次循环 检查每个粒子 是否超出 window的范围Y值，也就是 页面里看不到了，那么就 y 直接赋值为0；从最上方开始
		 * 4. 以上便构成了从慢到快的粒子速度效果
		 */
		function loop (){
			// 速度慢慢变快，但也不能 太快，限制一个 最快速度
			 speed += .5
			 speed = Math.min(speed,20)
			for (let i=0;i<particles.length;i++){
				let pItem = particles[i]
				pItem.gr.y += speed
				if(speed>=20){
					pItem.gr.scale.y = 40
					pItem.gr.scale.x = .03
				}
				if(pItem.gr.y>window.innerHeight) pItem.gr.y = 0
			}
		}
		/**
		 * 开始：默认就是开始 动画效果
		 * 速度归零
		 * 循环事件 开始
		 */
		function start(){
			speed = 0
			gsap.ticker.add(loop)
		}
		/**
		 * 结束：鼠标点击 按钮的时候
		 * 移除事件
		 * 将每个粒子的 位置 设置为初始值 + 加一些 动画效果，使得视觉更加的流畅和自然
		 */
		function pause(){
			gsap.ticker.remove(loop)
			// 暂停的时候；移除事件，并且位置回归，并加动画
			for (let i=0;i<particles.length;i++){
				let pItem = particles[i]
				pItem.gr.scale.y = 1
				pItem.gr.scale.x = 1
				// 缓动效果很关键 ease:'elastic.out'
				gsap.to(pItem.gr,{duration:.6,x:pItem.sx,y:pItem.sy,ease:'elastic.out'})
			}
		}
		return  {particleContainer,start,pause}
	}
	/**
	 * 工具函数
	 * 加载图片资源
	 * imageName 需要带后缀 eg abc.png
	 * imagePath 图片路径，可以不填，不填会自动规则 images/abc.png
	 * loader 场景的loader
	 */
	 helpLoadImage({imageName,imagePath,imageLoader}){
		if(!imageLoader) imageLoader = this.loader
		if(!imagePath) imagePath = `images/${imageName}`
		if(!imageLoader || !imagePath || !imageName) return console.error('加载资源不对，请检查')
		imageLoader.add(imageName,imagePath)
	}
	/**
	 * 工具函数
	 * 获取 Sprite（精灵）
	 * key:对应资源的key
	 */
	 helpGetSprite({key}){
		return key ? new PIXI.Sprite(this.loader.resources[key].texture) : null
	}
}
