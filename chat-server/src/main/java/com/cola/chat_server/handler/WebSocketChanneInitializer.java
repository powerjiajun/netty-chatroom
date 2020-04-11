package com.cola.chat_server.handler;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.stream.ChunkedWriteHandler;
/**
 * 
 * @author Administrator
 *
 */
public class WebSocketChanneInitializer extends ChannelInitializer<SocketChannel> {
    @Override
    protected void initChannel(SocketChannel socketChannel) throws Exception {
        //请求解码器
        socketChannel.pipeline().addLast("http-codec", new HttpServerCodec());
        //将多个消息转换成单一的消息对象
        socketChannel.pipeline().addLast("aggregator", new HttpObjectAggregator(65536));
        //支持异步发送大的码流，一般用于发送文件流
        socketChannel.pipeline().addLast("http-chunked", new ChunkedWriteHandler());
        //处理 websocket 和处理消息的发送
        socketChannel.pipeline().addLast("handler", new WebSocketSimpleChannelInboundHandler());
    }
}
