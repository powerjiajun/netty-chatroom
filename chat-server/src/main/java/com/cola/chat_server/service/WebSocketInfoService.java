package com.cola.chat_server.service;


import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;

import io.netty.channel.group.ChannelGroup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONObject;
import com.cola.chat_server.constant.MessageCodeConstant;
import com.cola.chat_server.constant.MessageTypeConstant;
import com.cola.chat_server.model.WsMessage;
import com.cola.chat_server.util.NettyAttrUtil;
import com.cola.chat_server.util.SessionHolder;

import io.netty.channel.Channel;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;

/**
 * Created with IntelliJ IDEA
 *
 * @Author
 * @Description
 * @Date 2020-02-15
 * @Time 20:56
 */
public class WebSocketInfoService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketInfoService.class);
    
    /**
     * 清除会话信息
     * @param channel
     */
    public void clearSession(Channel channel) {
        String userId = NettyAttrUtil.getUserId(channel);
        // 清除会话信息
        SessionHolder.channelGroup.remove(channel);
        SessionHolder.channelMap.remove(userId);
    }

    /**
     * 广播 ping 信息
     */
    public void sendPing() {
        WsMessage webSocketMessage = new WsMessage();
        webSocketMessage.setCode(MessageCodeConstant.PING_MESSAGE_CODE);
        String message = JSONObject.toJSONString(webSocketMessage);
        TextWebSocketFrame tws = new TextWebSocketFrame(message);
        SessionHolder.channelGroup.writeAndFlush(tws);
    }

    /**
     * 从缓存中移除Channel，并且关闭Channel
     */
    public void scanNotActiveChannel() {
        Map<String, Channel> channelMap = SessionHolder.channelMap;
        // 如果这个直播下已经没有连接中的用户会话了，删除频道
        if (channelMap.size() == 0) {
            return;
        }
        for (Channel channel : channelMap.values()) {
        	long lastHeartBeatTime = NettyAttrUtil.getLastHeartBeatTime(channel);
            long intervalMillis = (System.currentTimeMillis() - lastHeartBeatTime);
            if (!channel.isOpen()
                    || !channel.isActive()
                    || intervalMillis > 90000L) {
                channelMap.remove(channel);
                SessionHolder.channelGroup.remove(channel);
                if (channel.isOpen() || channel.isActive()) {
                    channel.close();
                }
            }
        }
    }
    
}
