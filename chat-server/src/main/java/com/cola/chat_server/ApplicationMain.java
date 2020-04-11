package com.cola.chat_server;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import com.cola.chat_server.constant.WebSocketConstant;
import com.cola.chat_server.handler.WebSocketChanneInitializer;
import com.cola.chat_server.service.WebSocketInfoService;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

/**
 * 服务启动类
 * @author Administrator
 *
 */
public class ApplicationMain 
{
    public static void main( String[] args )
    {
    	startNettyMsgServer();
    }
    
    private static void startNettyMsgServer() {
        // 使用多Reactor多线程模型，EventLoopGroup相当于线程池，内部维护一个或多个线程（EventLoop），每个EventLoop可处理多个Channel（单线程处理多个IO任务）
    	// 创建主线程组EventLoopGroup，专门负责建立连接
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        // 创建子线程组，专门负责IO任务的处理
        EventLoopGroup workGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workGroup);
            b.channel(NioServerSocketChannel.class);
            b.childHandler(new WebSocketChanneInitializer());
            System.out.println("服务端开启等待客户端连接....");
            Channel ch = b.bind(WebSocketConstant.WEB_SOCKET_PORT).sync().channel();

            //创建一个定长线程池，支持定时及周期性任务执行
            ScheduledExecutorService executorService = Executors.newScheduledThreadPool(3);
            WebSocketInfoService webSocketInfoService = new WebSocketInfoService();
            //定时任务:扫描所有的Channel，关闭失效的Channel
            executorService.scheduleAtFixedRate(webSocketInfoService::scanNotActiveChannel,
                    3, 60, TimeUnit.SECONDS);

            //定时任务:向所有客户端发送Ping消息
            executorService.scheduleAtFixedRate(webSocketInfoService::sendPing,
                    3, 50, TimeUnit.SECONDS);

            ch.closeFuture().sync();


        } catch (Exception e) {
            e.printStackTrace();
        } finally {
//            //退出程序
            bossGroup.shutdownGracefully();
            workGroup.shutdownGracefully();
        }
    }
}
