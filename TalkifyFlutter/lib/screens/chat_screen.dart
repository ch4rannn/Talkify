import 'package:flutter/material.dart';
import '../theme.dart';

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TealMidnightTheme.background,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: AppBar(
          backgroundColor: TealMidnightTheme.surface,
          titleSpacing: 0,
          title: Row(
            children: [
              const CircleAvatar(
                radius: 18,
                backgroundColor: TealMidnightTheme.surfaceHover,
                child: Icon(Icons.person, color: TealMidnightTheme.accent, size: 20),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Text('Demo Contact', style: TextStyle(fontSize: 16)),
                  Text('Online', style: TextStyle(fontSize: 12, color: TealMidnightTheme.accent, fontWeight: FontWeight.normal)),
                ],
              ),
            ],
          ),
          actions: [
            IconButton(icon: const Icon(Icons.call_outlined), onPressed: () {}),
            IconButton(icon: const Icon(Icons.videocam_outlined), onPressed: () {}),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
              reverse: true, // typical chat format
              itemCount: 20,
              itemBuilder: (context, index) {
                bool isMe = index % 2 == 0;
                return _buildMessageBubble(isMe);
              },
            ),
          ),
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4.0),
        padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
        constraints: const BoxConstraints(maxWidth: 280),
        decoration: BoxDecoration(
          color: isMe ? TealMidnightTheme.accentDim : TealMidnightTheme.surfaceHover,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isMe ? 18 : 6),
            bottomRight: Radius.circular(isMe ? 6 : 18),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              isMe ? 'This is a sent message. Sharp bottom-right corner.' : 'This is a received message. Sharp bottom-left corner with dark tone.',
              style: TextStyle(
                color: isMe ? Colors.white : TealMidnightTheme.textPrimary,
                fontSize: 15,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              '12:46 PM',
              style: TextStyle(
                color: isMe ? Colors.white70 : TealMidnightTheme.textSecondary,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      color: TealMidnightTheme.surface,
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
      child: SafeArea(
        child: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.attach_file, color: TealMidnightTheme.textSecondary),
              onPressed: () {},
            ),
            Expanded(
              child: Container(
                height: 44,
                decoration: BoxDecoration(
                  color: TealMidnightTheme.background,
                  borderRadius: BorderRadius.circular(24.0),
                ),
                child: const TextField(
                  style: TextStyle(color: TealMidnightTheme.textPrimary, fontSize: 15),
                  decoration: InputDecoration(
                    hintText: 'Type a message...',
                    hintStyle: TextStyle(color: TealMidnightTheme.textSecondary),
                    contentPadding: EdgeInsets.symmetric(horizontal: 20.0),
                    border: InputBorder.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 44,
              height: 44,
              decoration: const BoxDecoration(
                color: TealMidnightTheme.accent,
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.send, color: TealMidnightTheme.textOnAccent, size: 20),
                onPressed: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }
}
