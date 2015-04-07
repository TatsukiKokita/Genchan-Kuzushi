(function () {

    // Matter aliases
    var Engine = Matter.Engine,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Common = Matter.Common,
            Constraint = Matter.Constraint,
            Events = Matter.Events,
            MouseConstraint = Matter.MouseConstraint,
            Mouse = Matter.Mouse;

    var oldrock = {};

    var Demo = {};

    var _engine,
            _sceneName = 'mixed',
            _sceneWidth,
            _sceneHeight;

    _sceneWidth = 304;
    _sceneHeight = 440;

    var usedGenchan;
    Demo.init = function () {
        var canvasContainer = document.getElementById('world');


        _engine = Engine.create(canvasContainer, {
            render: {
                options: {
                    wireframes: false,
                    showAngleIndicator: false,
                    showDebug: false
                }
            }
        });

        _engine.enableSleeping = true;

        setTimeout(function () {
            Engine.run(_engine);
            Demo.updateScene();
        }, 0.1);

//        window.addEventListener('deviceorientation', Demo.updateGravity, true);
////        window.addEventListener('touchstart', Demo.fullscreen);
//        window.addEventListener('orientationchange', function () {
////            Demo.updateGravity();
//            Demo.updateScene();
//        }, false);
    };

    //window.addEventListener('load', Demo.init);

    $("button#start").click(function(){
        $("div#start").hide();
        $("div#world").show();
        Demo.init();
    });


    Demo.mixed = function () {
        var _world = _engine.world;

        Common._seed = 0;
        World.clear(_world);

        Engine.clear(_engine);

        var offset = 5;
        var underBlock = Bodies.rectangle(_sceneWidth * 0.5, _sceneHeight + offset, _sceneWidth + 0.5, 20, {density: 100, isStatic: true});
        World.addBody(_world, Bodies.rectangle(_sceneWidth * 0.5, -offset, _sceneWidth + 0.5, 20, {density: 100, isStatic: true}));
        World.addBody(_world, underBlock);
        World.addBody(_world, Bodies.rectangle(_sceneWidth + offset, _sceneHeight * 0.5, 20, _sceneHeight + 0.5, {density: 100, isStatic: true}));
        World.addBody(_world, Bodies.rectangle(-offset, _sceneHeight * 0.5, 20, _sceneHeight + 0.5, {density: 100, isStatic: true}));

        _world.gravity.x = 0;
        _world.gravity.y = 0;

        var addMouse = MouseConstraint.create(_engine);
        World.add(_world, addMouse);

        var blocks = new Object();
        var blocksCount = 48;
        blockCount = 0;
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 6; y++) {
                blocks[blockCount] = Bodies.rectangle(32 + 15 + 30 * x, 50 + 10 * y, 30, 10, {density: 100, isStatic: true, isSleeping: true});
                blockCount++;
            }
        }

        rockOptions = {density: 1,restitution: 1.25, frictionAir: 0, friction: 0,
            render: {//ボールのレンダリングの設定
                sprite: {//スプライトの設定
                    texture: './img/resize/player.png' //スプライトに使うテクスチャ画像を指定
                }
            }
        },
        rock = Bodies.circle(152, 350, 7.5, rockOptions),
                anchor = {x: 152, y: 330},
        elastic = Constraint.create({
            pointA: anchor,
            bodyB: rock,
            stiffness: 0.05,
            render: {
                lineWidth: 5,
                strokeStyle: '#dfa417'
            }
        });

        var genchanFlag = 0;
        var genchanHp = 3;
        usedGenchan = 1;
        World.add(_world, [rock, elastic]);
        for (i = 0; i < blockCount; i++) {
            World.add(_world, blocks[i]);
        }


        Events.on(_engine, 'tick', function (event) {

            if (_engine.input.mouse.button !== -1 && genchanFlag === 5) {
                genchanFlag = 0;
            }
            if (_engine.input.mouse.button !== -1 && rock.isSleeping !== true && genchanFlag === 0) {
                genchanFlag = 1;
            }
            if (_engine.input.mouse.button !== -1 && (rock.position.x !== 152 || rock.position.y !== 300) && genchanFlag === 1) {
                genchanFlag = 2;
            }
            if (_engine.input.mouse.button === -1 && (rock.position.y > 350) && genchanFlag === 2) {
                genchanFlag = 3;
            }
            if (genchanFlag === 3 && rock.position.y < 300) {
                genchanFlag = 4;
                oldrock = rock;
                rock = Bodies.circle(152, 350, 0.1, rockOptions);
                World.add(_engine.world, rock);
                elastic.bodyB = rock;
                underBlock.isStatic = false;
                underBlock.isSleeping = true;
                    for(b=0;b<blockCount;b++){
                        blocks[b].isStatic = false;
                    }
                //マウスイベント消したい
                World.remove(_engine.world, addMouse);

            }
            if (genchanFlag === 4) {
                for (b = 0; b < blockCount; b++) {
                    if (blocks[b].isSleeping === false) {
                        blocks[b].isSleeping = true;
                        if (judgeInclusion(oldrock, blocks[b], 20) === true) {
                            World.remove(_engine.world, blocks[b]);
                            blocksCount--;
                        }
                    }
                }
            }
            if ((underBlock.isSleeping === false || oldrock.isSleeping === true) && genchanFlag === 4) {
                genchanHp--;
                World.remove(_engine.world, underBlock);
                underBlock = Bodies.rectangle(_sceneWidth * 0.5, _sceneHeight + offset, _sceneWidth + 0.5, 20, {density: 100, isStatic: false, isSleeping: true});
                World.addBody(_engine.world, underBlock);
                if (genchanHp === 0) {
                    World.remove(_engine.world, oldrock);
                    usedGenchan++;
                    genchanHp = 3;
                    tmprock = rock;
                    World.remove(_engine.world, tmprock);
                    //新しいげんちゃんをセット
                    rock = Bodies.circle(152, 350, 7.5, rockOptions);
                    World.add(_engine.world, rock);
                    elastic.bodyB = rock;
                    genchanFlag = 5;
                    underBlock.isStatic = true;
                    for (b = 0; b < blockCount; b++) {
                        blocks[b].isStatic = true;
                    }
                    World.add(_engine.world, addMouse);
                }
            }
            if (blocksCount === 0) {
                blocksCount = 48;
                Demo.resultScene();
            }
        });
        var renderOptions = _engine.render.options;
        renderOptions.wireframes = false;
        renderOptions.showAngleIndicator = false;
    };

    Demo.resultScene = function () {
        $("div#world").hide();
        $("div#result").show();
        $("div#point").text(usedGenchan);
        $("button#next").click(function () {
            $("div#result").hide();
            $("div#point").text();
            Demo.reset();
            $("div#start").show();
        });
    };

    Demo.updateScene = function () {
        if (!_engine)
            return;

        var boundsMax = _engine.world.bounds.max,
                renderOptions = _engine.render.options,
                canvas = _engine.render.canvas;

        boundsMax.x = _sceneWidth;
        boundsMax.y = _sceneHeight;

        canvas.width = renderOptions.width = _sceneWidth;
        canvas.height = renderOptions.height = _sceneHeight;

        Demo[_sceneName]();
    };

    Demo.reset = function () {
        var _world = _engine.world;


        World.clear(_world);
        Engine.clear(_engine);
        $("#world canvas").remove();

    };

    /*
     * p1 rock
     * p2 block
     * r rock range
     */
    judgeInclusion = function (p1, p2, r) {

        var p1x = p1.position.x;
        var p1y = p1.position.y;
        var p2x = p2.position.x;
        var p2y = p2.position.y;

        var p2 = [[p2x - 15, p2y + 5], [p2x + 15, p2y + 5], [p2x + 15, p2y - 5], [p2x - 15, p2y - 5]]

        var v2 = [[30, 0], [0, -10], [-30, 0], [0, 10]];

        var v = new Array();
        v[0] = [p2x - 15 - p1x, p2y - 5 - p1y];
        v[1] = [p2x - 15 - p1x, p2y + 5 - p1y];
        v[2] = [p2x + 15 - p1x, p2y - 5 - p1y];
        v[3] = [p2x + 15 - p1x, p2y + 5 - p1y];

        var c = 0;
        var check = false;
        var finalcheckcount = 0;
        for (a = 0; a <= 3; a++) {
            c++;
            if (c === 4) {
                c = 0;
            }
            if (v[a][0] * v2[a][0] + v[a][1] * v2[a][1] <= 0) {
                if (v[c][0] * v2[a][0] + v[c][1] * v2[a][1] >= 0) {
                    if (Math.abs(v[a][0] * v2[a][1] - v[a][1] * v2[a][0]) / Math.sqrt(Math.pow(v[a][0], 2) + Math.pow(v[a][1]), 2) <= r) {
                        check = true;
                    }
                }
            }
            if (!check) {
                if (Math.pow(p1x - p2[a][0], 2) + Math.pow(p1y - p2[a][1], 2) <= Math.pow(r, 2) || Math.pow(p1x - p2[c][0], 2) + Math.pow((p1y - p2[c][1]), 2) <= Math.pow(r, 2)) {
                    check = true;
                }
            }
            if (!check) {
                if (v[a][0] * v2[a][0] + v[a][1] * v2[a][1] <= 0) {
                    finalcheckcount++;
                }
            }
        }
        if (!check && finalcheckcount === 4) {
            check = true;
        }
        return check;
    };

})();