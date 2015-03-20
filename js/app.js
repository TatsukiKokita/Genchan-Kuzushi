(function() {

    // Matter aliases
    var Engine = Matter.Engine,
        Gui = Matter.Gui,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint;

    var Demo = {};

    var _engine,
        _sceneName = 'mixed',
        _sceneWidth,
        _sceneHeight;

    Demo.init = function() {
        var canvasContainer = document.getElementById('world');
        
        
        _engine = Engine.create(canvasContainer, {
            render: {
                options: {
                    wireframes: false,
                    showAngleIndicator: false,
                    showDebug: true
                }
            }
        });

        setTimeout(function() {
            Engine.run(_engine);
            Demo.updateScene();
        }, 800);
        
        window.addEventListener('deviceorientation', Demo.updateGravity, true);
        window.addEventListener('touchstart', Demo.fullscreen);
        window.addEventListener('orientationchange', function() {
            Demo.updateGravity();
            Demo.updateScene();
        }, false);
    };

    window.addEventListener('load', Demo.init);

    Demo.mixed = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        _world.gravity.x=0;
        _world.gravity.y=0;

        World.add(_world, MouseConstraint.create(_engine));
        
//        var stack = Composites.stack(100, 50, 1, 10, 0, 0, function(x, y, column, row) {
//            
//            return Bodies.rectangle(x, y, 50, 50, {
//                    render: {//ボールのレンダリングの設定
//                        sprite: {//スプライトの設定
//                            texture: './img/resize/player.png' //スプライトに使うテクスチャ画像を指定
//                        }
//                    }
//                });
        var stack = Composites.stack(40, 50, 8, 4, 0, 0, function(x, y, column, row) {
            
            return Bodies.rectangle(x, y, 30, 10, { density: 100,  restitution: 1,isStatic:true,friction:0});
//            switch (Math.round(Common.random(0, 1))) {
//                
//            case 0:
//                if (Common.random() < 0.8) {
//                    return Bodies.rectangle(x, y, Common.random(20, 40), Common.random(20, 40), { friction: 0.01, restitution: 0.4 });
//                } else {
//                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30), { friction: 0.01, restitution: 0.4 });
//                }
//                break;
//            case 1:
//                return Bodies.polygon(x, y, Math.round(Common.random(4, 6)), Common.random(20, 40), { friction: 0.01, restitution: 0.4 });
//            
//            }
        });
//        var bodyStackX = Composites.stack(5,5,2,1,_sceneWidth-5,0,function(x,y,column,row){
//            return Bodies.rectangle(x, y, 1, _sceneHeight,{ density: 1/_sceneHeight,isStatic:true,friction:0});
//        });
//        var bodyStackY = Composites.stack(5,5,1,2,0,_sceneHeight,function(x,y,column,row){
//            return Bodies.rectangle(x, y, _sceneWidth,1,{ density: 1/_sceneWidth,isStatic:true,friction:0});
//        });
        var genchan = Bodies.circle(50,100,10,{ density: 1,restitution:1.4,frictionAir: 0,friction:0});
        
        World.add(_world, genchan);
        World.add(_world, stack);
//        World.add(_world, bodyStackX);
//        World.add(_world, bodyStackY);
    };
    
    Demo.updateScene = function() {
        if (!_engine)
            return;
        
        _sceneWidth = document.documentElement.clientWidth;
        _sceneHeight = document.documentElement.clientHeight;

        var boundsMax = _engine.world.bounds.max,
            renderOptions = _engine.render.options,
            canvas = _engine.render.canvas;

        boundsMax.x = _sceneWidth;
        boundsMax.y = _sceneHeight;

        canvas.width = renderOptions.width = _sceneWidth;
        canvas.height = renderOptions.height = _sceneHeight;

        Demo[_sceneName]();
    };
    
    Demo.updateGravity = function () {
        if (!_engine)
            return;
        
        var orientation = window.orientation,
            gravity = _engine.world.gravity;

        if (orientation === 0) {
            gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
            gravity.y = Common.clamp(event.beta, -90, 90) / 90;
        } else if (orientation === 180) {
            gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
            gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
        } else if (orientation === 90) {
            gravity.x = Common.clamp(event.beta, -90, 90) / 90;
            gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
        } else if (orientation === -90) {
            gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
            gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
        }
    };
    
    Demo.reset = function() {
        var _world = _engine.world;

        Common._seed = 2;
        
        World.clear(_world);
        Engine.clear(_engine);
        
        var offset = 5;
        World.addBody(_world, Bodies.rectangle(_sceneWidth * 0.5, -offset, _sceneWidth + 0.5, 50.5, {density:100, isStatic: true }));
        World.addBody(_world, Bodies.rectangle(_sceneWidth * 0.5, _sceneHeight + offset, _sceneWidth + 0.5, 50.5, {density:100, isStatic: true }));
        World.addBody(_world, Bodies.rectangle(_sceneWidth + offset, _sceneHeight * 0.5, 50.5, _sceneHeight + 0.5, {density:100, isStatic: true }));
        World.addBody(_world, Bodies.rectangle(-offset, _sceneHeight * 0.5, 50.5, _sceneHeight + 0.5, {density:100, isStatic: true }));
    };

})();